class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.gameState = 'menu';
    this.score = 0;
    this.lives = GameConfig.game.maxLives;
    this.level = 1;
    
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);
    this.bullets = [];
    this.alienGrid = new AlienGrid(this.level);
    this.particles = [];
    
    this.keys = {};
    this.lastTime = 0;
    this.animationId = null;
    
    // Mobile touch state
    this.touchState = {
      left: false,
      right: false,
      shooting: false
    };
    
    this.bindEvents();
    this.bindMobileEvents();
    this.showStartScreen();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.handleKeyPress(e);
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.getElementById('start-button').addEventListener('click', () => {
      this.startGame();
    });

    document.addEventListener('click', () => {
      audioManager.resumeContext();
    });
  }

  handleKeyPress(e) {
    if (e.code === 'Space' && this.gameState === 'playing') {
      e.preventDefault();
      this.player.shoot();
    }
    
    if (e.code === 'KeyP' && this.gameState === 'playing') {
      this.pauseGame();
    }
    
    if (e.code === 'Enter' && this.gameState !== 'playing') {
      this.startGame();
    }
  }

  showStartScreen() {
    this.gameState = 'menu';
    // Better touch device detection including iPads
    const isTouchDevice = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0 ||
                         window.innerWidth <= 768;
    
    const controls = isTouchDevice ? 
      'Use the LEFT and RIGHT buttons to move\nTap the SHOOT button to fire!' :
      'Use arrow keys to move and spacebar to shoot!';
    
    Utils.showMessage(
      '🚀 Space Invaders! 🛸',
      `Defend Earth from the colorful alien invasion!\n${controls}`,
      'Start Adventure',
      () => this.startGame()
    );
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.lives = GameConfig.game.maxLives;
    this.level = 1;
    
    this.resetGame();
    Utils.hideMessage();
    Utils.updateScore(this.score);
    Utils.updateLives(this.lives);
    
    audioManager.playSound('powerUp');
    this.gameLoop();
  }

  resetGame() {
    this.player.reset(this.canvas.width / 2, this.canvas.height - 50);
    this.bullets = [];
    this.particles = [];
    this.alienGrid = new AlienGrid(this.level);
  }

  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      Utils.showMessage(
        '⏸️ Game Paused',
        'Press P to continue or Enter to restart',
        'Continue',
        () => this.resumeGame()
      );
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.gameState = 'playing';
    Utils.hideMessage();
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    
    if (this.gameState !== 'gameOver') {
      this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
  }

  update(deltaTime) {
    this.handleInput();
    this.updateBullets();
    this.updateAliens();
    this.updateParticles();
    this.checkCollisions();
    this.checkGameConditions();
  }

  handleInput() {
    // Keyboard input
    if (this.keys['ArrowLeft']) {
      this.player.moveLeft();
    }
    if (this.keys['ArrowRight']) {
      this.player.moveRight(this.canvas.width);
    }
    
    // Touch input
    if (this.touchState.left) {
      this.player.moveLeft();
    }
    if (this.touchState.right) {
      this.player.moveRight(this.canvas.width);
    }
  }

  bindMobileEvents() {
    // Get button elements
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const shootButton = document.getElementById('shoot-button');

    if (!leftButton || !rightButton || !shootButton) {
      console.log('Mobile control buttons not found');
      return;
    }

    // Prevent default touch behaviors
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Left button events
    leftButton.addEventListener('touchstart', (e) => {
      preventDefaults(e);
      this.touchState.left = true;
      console.log('Left button touch start');
    });

    leftButton.addEventListener('touchend', (e) => {
      preventDefaults(e);
      this.touchState.left = false;
      console.log('Left button touch end');
    });

    leftButton.addEventListener('touchcancel', (e) => {
      preventDefaults(e);
      this.touchState.left = false;
    });

    // Right button events
    rightButton.addEventListener('touchstart', (e) => {
      preventDefaults(e);
      this.touchState.right = true;
      console.log('Right button touch start');
    });

    rightButton.addEventListener('touchend', (e) => {
      preventDefaults(e);
      this.touchState.right = false;
      console.log('Right button touch end');
    });

    rightButton.addEventListener('touchcancel', (e) => {
      preventDefaults(e);
      this.touchState.right = false;
    });

    // Shoot button events
    shootButton.addEventListener('touchstart', (e) => {
      preventDefaults(e);
      console.log('Shoot button touched, game state:', this.gameState);
      if (this.gameState === 'playing') {
        this.player.shoot();
        audioManager.resumeContext();
      }
    });

    shootButton.addEventListener('touchend', preventDefaults);
    shootButton.addEventListener('touchcancel', preventDefaults);

    // Add mouse events for testing on desktop
    leftButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.touchState.left = true;
      console.log('Left button mouse down');
    });

    leftButton.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.touchState.left = false;
    });

    leftButton.addEventListener('mouseleave', (e) => {
      this.touchState.left = false;
    });

    rightButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.touchState.right = true;
      console.log('Right button mouse down');
    });

    rightButton.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.touchState.right = false;
    });

    rightButton.addEventListener('mouseleave', (e) => {
      this.touchState.right = false;
    });

    shootButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      console.log('Shoot button clicked, game state:', this.gameState);
      if (this.gameState === 'playing') {
        this.player.shoot();
        audioManager.resumeContext();
      }
    });

    // Global touch event cleanup
    document.addEventListener('touchend', () => {
      this.touchState.left = false;
      this.touchState.right = false;
    });

    document.addEventListener('touchcancel', () => {
      this.touchState.left = false;
      this.touchState.right = false;
    });

    console.log('Mobile event handlers bound successfully');
  }

  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.y > 0;
    });
  }

  updateAliens() {
    this.alienGrid.update(this.canvas.width, this.canvas.height, this.player.x + this.player.width / 2);
  }

  updateParticles() {
    this.particles = this.particles.filter(particle => {
      return Utils.updateParticle(particle);
    });
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const hit = this.alienGrid.checkCollision(bullet);
      
      if (hit) {
        this.bullets.splice(i, 1);
        
        if (hit.type === 'alien') {
          this.alienGrid.removeAlien(hit.object);
          this.addScore(GameConfig.game.pointsPerAlien);
          this.createExplosion(hit.object.x + hit.object.width / 2, hit.object.y + hit.object.height / 2);
          audioManager.playSound('hit');
        } else if (hit.type === 'diveBomber') {
          this.alienGrid.removeDiveBomber(hit.object);
          this.addScore(GameConfig.diveBomber.pointValue);
          this.createExplosion(hit.object.x + hit.object.width / 2, hit.object.y + hit.object.height / 2);
          audioManager.playSound('hit');
        }
      }
    }

    if (this.alienGrid.checkPlayerCollision(this.player)) {
      this.playerHit();
    }

    const alienBullets = this.alienGrid.getBullets();
    for (let bullet of alienBullets) {
      if (CollisionDetector.bulletPlayerCollision(bullet, this.player)) {
        this.playerHit();
        this.alienGrid.removeBullet(bullet);
      }
    }
  }

  checkGameConditions() {
    if (this.alienGrid.isEmpty()) {
      this.levelComplete();
    }
    
    if (this.lives <= 0) {
      this.gameOver();
    }
    
    if (this.alienGrid.hasReachedBottom(this.canvas.height)) {
      this.gameOver();
    }
  }

  addScore(points) {
    this.score += points;
    Utils.updateScore(this.score);
    
    if (this.score % GameConfig.game.bonusThreshold === 0) {
      this.lives++;
      Utils.updateLives(this.lives);
      audioManager.playSound('powerUp');
      Utils.showNotification('🎉 Bonus Life!', 'bonus', 3000);
    }
  }

  playerHit() {
    this.lives--;
    Utils.updateLives(this.lives);
    this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    audioManager.playSound('explosion');
    
    if (this.lives > 0) {
      Utils.showNotification(`💥 ${this.lives} lives left!`, 'hit', 2000);
    }
  }

  levelComplete() {
    this.level++;
    audioManager.playSound('victory');
    Utils.showMessage(
      '🎉 Level Complete!',
      `Amazing job! Ready for level ${this.level}?\nAliens will be faster and more aggressive!`,
      'Next Level',
      () => this.nextLevel()
    );
  }

  nextLevel() {
    this.resetGame();
    Utils.hideMessage();
  }

  gameOver() {
    this.gameState = 'gameOver';
    audioManager.playSound('gameOver');
    
    let message = this.score > 5000 ? 
      '🌟 Incredible! You\'re a space hero!' : 
      this.score > 2000 ? 
      '🚀 Great job! You\'re getting better!' : 
      '👍 Good try! Practice makes perfect!';
    
    Utils.showMessage(
      '🎮 Game Over',
      `${message}\nFinal Score: ${this.score.toLocaleString()}`,
      'Play Again',
      () => this.startGame()
    );
  }

  createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = Utils.randomInt(2, 5);
      const particle = Utils.createParticle(
        x, y,
        Utils.getRandomExplosionColor(),
        Utils.randomInt(3, 6),
        {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        }
      );
      this.particles.push(particle);
    }
  }

  render() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawStars();
    this.player.draw(this.ctx);
    this.alienGrid.draw(this.ctx);
    
    this.bullets.forEach(bullet => bullet.draw(this.ctx));
    this.particles.forEach(particle => Utils.drawParticle(this.ctx, particle));
  }

  drawStars() {
    this.ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
      const x = (i * 13 + this.lastTime * 0.01) % this.canvas.width;
      const y = (i * 17) % this.canvas.height;
      const size = (i % 3) + 1;
      
      this.ctx.globalAlpha = 0.3 + (i % 3) * 0.2;
      this.ctx.fillRect(x, y, size, size);
    }
    this.ctx.globalAlpha = 1;
  }
}

let game;

window.addEventListener('load', () => {
  game = new Game();
  window.game = game;
});

window.addEventListener('beforeunload', () => {
  if (game && game.animationId) {
    cancelAnimationFrame(game.animationId);
  }
});