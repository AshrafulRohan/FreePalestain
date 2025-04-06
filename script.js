// Enhanced Game Variables
const gameState = {
    score: 0,
    timeLeft: 60,
    level: 1,
    highScore: localStorage.getItem('highScore') || 0,
    gameInterval: null,
    isPaused: false,
    difficulty: 'medium',
    powerups: {
        rapidFire: { count: 3, active: false, duration: 5000 },
        timeFreeze: { count: 2, active: false, duration: 7000 }
    },
    targetCount: 0,
    accuracy: { hits: 0, shots: 0 }
};

// Criminal images with more variety
const criminals = [
    'https://www.publicdomainpictures.net/pictures/370000/t2/model-face-of-president-trump.jpg',
    'https://thumbs.dreamstime.com/z/benjamin-netanyahu-prime-minister-israel-cartoon-portrait-illustrated-ayval%C4%B1k-erkan-atay-caricature-portrait-israeli-195086671.jpg',
    
];

// DOM elements
const elements = {
    targetArea: document.getElementById('target-area'),
    scoreDisplay: document.getElementById('score'),
    timeDisplay: document.getElementById('time'),
    levelDisplay: document.getElementById('level'),
    highScoreDisplay: document.getElementById('high-score'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    difficultySelect: document.getElementById('difficulty'),
    rapidFireBtn: document.getElementById('rapid-fire'),
    timeFreezeBtn: document.getElementById('time-freeze'),
    audio: {
        shot: document.getElementById('shot-sound'),
        hit: document.getElementById('hit-sound'),
        powerup: document.getElementById('powerup-sound'),
        levelup: document.getElementById('levelup-sound')
    }
};

// Initialize game
function initGame() {
    updateUI();
    setupEventListeners();
}

// Update all UI elements
function updateUI() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.timeDisplay.textContent = gameState.timeLeft;
    elements.levelDisplay.textContent = gameState.level;
    elements.highScoreDisplay.textContent = gameState.highScore;
    
    // Update powerup displays
    elements.rapidFireBtn.textContent = `🔥 Rapid Fire (${gameState.powerups.rapidFire.count})`;
    elements.timeFreezeBtn.textContent = `⏱️ Time Freeze (${gameState.powerups.timeFreeze.count})`;
    
    // Disable powerups if count is 0
    elements.rapidFireBtn.style.opacity = gameState.powerups.rapidFire.count > 0 ? 1 : 0.5;
    elements.timeFreezeBtn.style.opacity = gameState.powerups.timeFreeze.count > 0 ? 1 : 0.5;
}

// Setup event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.difficultySelect.addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
    });
    
    // Powerup buttons
    elements.rapidFireBtn.addEventListener('click', activateRapidFire);
    elements.timeFreezeBtn.addEventListener('click', activateTimeFreeze);
}

// Start game function
function startGame() {
    resetGameState();
    updateUI();
    
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.difficultySelect.disabled = true;
    gameState.isPaused = false;
    
    // Create targets
    gameState.gameInterval = setInterval(createTarget, getSpawnRate());
    
    // Game timer
    const timer = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            elements.timeDisplay.textContent = gameState.timeLeft;
            
            if (gameState.timeLeft <= 0) {
                endGame(timer);
            }
            
            // Level up every 15 seconds
            if (gameState.timeLeft % 15 === 0 && gameState.timeLeft < 60) {
                levelUp();
            }
        }
    }, 1000);
}

// Reset game state
function resetGameState() {
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.level = 1;
    gameState.targetCount = 0;
    gameState.accuracy = { hits: 0, shots: 0 };
    elements.targetArea.innerHTML = '';
}

// End game function
function endGame(timer) {
    clearInterval(timer);
    clearInterval(gameState.gameInterval);
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.difficultySelect.disabled = false;
    
    // Calculate accuracy
    const accuracy = gameState.accuracy.shots > 0 
        ? Math.round((gameState.accuracy.hits / gameState.accuracy.shots) * 100)
        : 0;
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        elements.highScoreDisplay.textContent = gameState.highScore;
        
        // Show victory message
        showGameOverMessage(
            `🎉 New High Score! 🎉\n\nScore: ${gameState.score}\nAccuracy: ${accuracy}%`,
            '#4CAF50'
        );
    } else {
        showGameOverMessage(
            `Game Over!\n\nScore: ${gameState.score}\nAccuracy: ${accuracy}%`,
            '#FF4757'
        );
    }
}

// Show game over message
function showGameOverMessage(message, color) {
    const messageBox = document.createElement('div');
    messageBox.style.position = 'fixed';
    messageBox.style.top = '50%';
    messageBox.style.left = '50%';
    messageBox.style.transform = 'translate(-50%, -50%)';
    messageBox.style.backgroundColor = 'rgba(30, 39, 46, 0.9)';
    messageBox.style.color = color;
    messageBox.style.padding = '20px';
    messageBox.style.borderRadius = '10px';
    messageBox.style.border = `3px solid ${color}`;
    messageBox.style.zIndex = '1000';
    messageBox.style.textAlign = 'center';
    messageBox.style.fontSize = '1.2rem';
    messageBox.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    messageBox.style.whiteSpace = 'pre-line';
    messageBox.innerHTML = message + '<br><button style="margin-top:15px;padding:8px 15px;background:' + color + ';border:none;border-radius:5px;cursor:pointer;">OK</button>';
    
    messageBox.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(messageBox);
    });
    
    document.body.appendChild(messageBox);
}

// Level up function
function levelUp() {
    gameState.level++;
    elements.levelDisplay.textContent = gameState.level;
    
    // Play level up sound
    if (elements.audio.levelup) {
        elements.audio.levelup.currentTime = 0;
        elements.audio.levelup.play();
    }
    
    // Visual effect
    elements.levelDisplay.classList.add('level-up');
    setTimeout(() => {
        elements.levelDisplay.classList.remove('level-up');
    }, 1500);
    
    // Increase difficulty
    clearInterval(gameState.gameInterval);
    gameState.gameInterval = setInterval(createTarget, getSpawnRate());
}

// Create target function
function createTarget() {
    if (gameState.isPaused) return;
    
    const target = document.createElement('img');
    target.className = 'target';
    
    // Random position (avoid edges)
    const margin = 20;
    const x = margin + Math.random() * (elements.targetArea.offsetWidth - 80 - margin * 2);
    const y = margin + Math.random() * (elements.targetArea.offsetHeight - 80 - margin * 2);
    
    // Random criminal image
    const randomCriminal = criminals[Math.floor(Math.random() * criminals.length)];
    target.src = randomCriminal;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    
    // Click event
    target.addEventListener('click', function() {
        if (!this.classList.contains('shot')) {
            gameState.accuracy.shots++;
            this.classList.add('shot');
            
            // Play shot sound
            if (elements.audio.shot) {
                elements.audio.shot.currentTime = 0;
                elements.audio.shot.play();
            }
            
            // Score points
            const points = gameState.powerups.rapidFire.active ? 15 : 10;
            gameState.score += points;
            gameState.accuracy.hits++;
            elements.scoreDisplay.textContent = gameState.score;
            
            // Create blood effect
            createBloodEffect(this);
            
            // Play hit sound
            if (elements.audio.hit) {
                elements.audio.hit.currentTime = 0;
                elements.audio.hit.play();
            }
            
            // Remove target after animation
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                    gameState.targetCount--;
                }
            }, 300);
        }
    });
    
    // Auto-remove after timeout
    const timeout = setTimeout(() => {
        if (target.parentNode && !target.classList.contains('shot')) {
            target.remove();
            gameState.targetCount--;
        }
    }, getTargetDuration());
    
    // Add to DOM
    elements.targetArea.appendChild(target);
    gameState.targetCount++;
    
    // Store timeout reference on target element
    target.timeout = timeout;
}

// Create blood effect
function createBloodEffect(targetElement) {
    const blood = document.createElement('div');
    blood.className = 'blood-effect';
    blood.style.left = `${targetElement.offsetLeft - 10}px`;
    blood.style.top = `${targetElement.offsetTop - 10}px`;
    elements.targetArea.appendChild(blood);
    
    // Remove after animation
    setTimeout(() => {
        if (blood.parentNode) {
            blood.remove();
        }
    }, 800);
}

// Toggle pause
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    elements.pauseBtn.textContent = gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';
    
    if (gameState.isPaused) {
        elements.targetArea.style.opacity = '0.7';
        
        // Clear all target timeouts
        document.querySelectorAll('.target:not(.shot)').forEach(target => {
            clearTimeout(target.timeout);
        });
    } else {
        elements.targetArea.style.opacity = '1';
        
        // Reset timeouts for remaining targets
        document.querySelectorAll('.target:not(.shot)').forEach(target => {
            target.timeout = setTimeout(() => {
                if (target.parentNode) {
                    target.remove();
                    gameState.targetCount--;
                }
            }, getTargetDuration());
        });
    }
}

// Powerup: Rapid Fire
function activateRapidFire() {
    if (gameState.powerups.rapidFire.count <= 0 || gameState.powerups.rapidFire.active) return;
    
    gameState.powerups.rapidFire.count--;
    gameState.powerups.rapidFire.active = true;
    updateUI();
    
    // Play powerup sound
    if (elements.audio.powerup) {
        elements.audio.powerup.currentTime = 0;
        elements.audio.powerup.play();
    }
    
    // Visual feedback
    elements.rapidFireBtn.style.animation = 'pulse 0.5s infinite alternate';
    
    // Reset after duration
    setTimeout(() => {
        gameState.powerups.rapidFire.active = false;
        elements.rapidFireBtn.style.animation = '';
        updateUI();
    }, gameState.powerups.rapidFire.duration);
}

// Powerup: Time Freeze
function activateTimeFreeze() {
    if (gameState.powerups.timeFreeze.count <= 0 || gameState.powerups.timeFreeze.active) return;
    
    gameState.powerups.timeFreeze.count--;
    gameState.powerups.timeFreeze.active = true;
    updateUI();
    
    // Play powerup sound
    if (elements.audio.powerup) {
        elements.audio.powerup.currentTime = 0;
        elements.audio.powerup.play();
    }
    
    // Visual feedback
    elements.timeFreezeBtn.style.animation = 'pulse 0.5s infinite alternate';
    elements.targetArea.style.borderColor = '#00d2d3';
    
    // Reset after duration
    setTimeout(() => {
        gameState.powerups.timeFreeze.active = false;
        elements.timeFreezeBtn.style.animation = '';
        elements.targetArea.style.borderColor = '#ff4757';
        updateUI();
    }, gameState.powerups.timeFreeze.duration);
}

// Helper functions
function getSpawnRate() {
    const baseRates = {
        easy: 1500,
        medium: 1000,
        hard: 600
    };
    
    // Adjust based on level
    const levelFactor = Math.max(0.3, 1 - (gameState.level * 0.05));
    return baseRates[gameState.difficulty] * levelFactor;
}

function getTargetDuration() {
    const baseDurations = {
        easy: 2500,
        medium: 1800,
        hard: 1200
    };
    
    // Adjust based on level
    const levelFactor = Math.max(0.4, 1 - (gameState.level * 0.03));
    return baseDurations[gameState.difficulty] * levelFactor;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);