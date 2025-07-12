class Alien {
  constructor(x, y, type = 0) {
    this.x = x;
    this.y = y;
    this.width = GameConfig.alien.width;
    this.height = GameConfig.alien.height;
    this.type = type;
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    this.color = this.colors[type % this.colors.length];
    this.animationFrame = 0;
    this.animationSpeed = 0.1;
  }

  update() {
    this.animationFrame += this.animationSpeed;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  draw(ctx) {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const bounce = Math.sin(this.animationFrame) * 2;
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + bounce, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    const eyeOffset = 6;
    const eyeSize = 4;
    const eyeY = centerY - 5 + bounce;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(centerX + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    const pupilOffset = Math.sin(this.animationFrame * 2) * 1;
    ctx.beginPath();
    ctx.arc(centerX - eyeOffset + pupilOffset, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(centerX + eyeOffset - pupilOffset, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    
    const tentacleCount = 4;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < tentacleCount; i++) {
      const tentacleX = this.x + (this.width / (tentacleCount + 1)) * (i + 1);
      const tentacleStartY = this.y + this.height;
      const tentacleLength = 8 + Math.sin(this.animationFrame * 3 + i) * 3;
      
      ctx.beginPath();
      ctx.moveTo(tentacleX, tentacleStartY);
      ctx.lineTo(tentacleX, tentacleStartY + tentacleLength);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

class DiveBomberAlien {
  constructor(x, y, targetX) {
    this.x = x;
    this.y = y;
    this.width = GameConfig.diveBomber.width;
    this.height = GameConfig.diveBomber.height;
    this.targetX = targetX;
    this.speed = GameConfig.diveBomber.speed;
    this.color = '#FF4444';
    this.animationFrame = 0;
    this.animationSpeed = 0.2;
    this.isDiving = true;
  }

  update() {
    this.animationFrame += this.animationSpeed;
    
    if (this.isDiving) {
      const dx = this.targetX - this.x;
      const distance = Math.sqrt(dx * dx);
      
      if (distance > 5) {
        this.x += (dx / distance) * this.speed * 0.5;
      }
      
      this.y += this.speed;
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  draw(ctx) {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const pulse = Math.sin(this.animationFrame * 2) * 0.1 + 1;
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFAAAA';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, (this.width / 2) * pulse, (this.height / 2) * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    const eyeSize = 3 * pulse;
    const eyeY = centerY - 3;
    
    ctx.beginPath();
    ctx.arc(centerX - 5, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(centerX + 5, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(centerX - 5, eyeY, 1.5, 0, Math.PI * 2);
    ctx.arc(centerX + 5, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, this.y + this.height);
    ctx.lineTo(centerX - 10, this.y + this.height + 8);
    ctx.moveTo(centerX + 8, this.y + this.height);
    ctx.lineTo(centerX + 10, this.y + this.height + 8);
    ctx.stroke();
    
    ctx.restore();
  }
}

class AlienGrid {
  constructor(level = 1) {
    this.aliens = [];
    this.bullets = [];
    this.diveBombers = [];
    this.direction = 1;
    this.baseSpeed = GameConfig.alien.speed;
    this.speed = this.baseSpeed + (level - 1) * GameConfig.alien.speedIncrease;
    this.dropDistance = GameConfig.alien.dropDistance;
    this.shouldDrop = false;
    this.lastShotTime = 0;
    this.baseShotInterval = 2000;
    this.shotInterval = Math.max(800, this.baseShotInterval - (level - 1) * this.baseShotInterval * GameConfig.alien.shootIntervalDecrease);
    this.level = level;
    this.lastDiveBomberTime = 0;
    this.diveBomberInterval = 5000;
    
    this.createGrid();
  }

  createGrid() {
    this.aliens = [];
    const startX = 80;
    const startY = 80;
    
    for (let row = 0; row < GameConfig.alien.rows; row++) {
      for (let col = 0; col < GameConfig.alien.cols; col++) {
        const x = startX + col * GameConfig.alien.spacing;
        const y = startY + row * GameConfig.alien.spacing;
        this.aliens.push(new Alien(x, y, row));
      }
    }
  }

  update(canvasWidth, canvasHeight, playerX) {
    if (this.aliens.length === 0) return;
    
    this.checkBounds(canvasWidth);
    this.moveAliens();
    this.updateBullets();
    this.updateDiveBombers(canvasHeight);
    this.maybeShoot();
    this.maybeSpawnDiveBomber(canvasWidth, playerX);
    
    this.aliens.forEach(alien => alien.update());
  }

  checkBounds(canvasWidth) {
    let shouldDrop = false;
    
    for (let alien of this.aliens) {
      if ((alien.x <= 0 && this.direction === -1) || 
          (alien.x + alien.width >= canvasWidth && this.direction === 1)) {
        shouldDrop = true;
        break;
      }
    }
    
    if (shouldDrop) {
      this.direction *= -1;
      this.shouldDrop = true;
    }
  }

  moveAliens() {
    if (this.shouldDrop) {
      this.aliens.forEach(alien => {
        alien.y += this.dropDistance;
      });
      this.shouldDrop = false;
      this.speed *= 1.1;
    } else {
      this.aliens.forEach(alien => {
        alien.x += this.speed * this.direction;
      });
    }
  }

  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.y < 600;
    });
  }

  updateDiveBombers(canvasHeight) {
    this.diveBombers = this.diveBombers.filter(diveBomber => {
      diveBomber.update();
      return diveBomber.y < canvasHeight + 50;
    });
  }

  maybeSpawnDiveBomber(canvasWidth, playerX) {
    const now = Date.now();
    if (now - this.lastDiveBomberTime > this.diveBomberInterval && 
        this.diveBombers.length < GameConfig.diveBomber.maxActive &&
        this.aliens.length > 0) {
      
      if (Math.random() < GameConfig.diveBomber.spawnChance * 60) {
        const spawnX = Math.random() * canvasWidth;
        const spawnY = -30;
        const targetX = playerX + Utils.randomInt(-50, 50);
        
        this.diveBombers.push(new DiveBomberAlien(spawnX, spawnY, targetX));
        this.lastDiveBomberTime = now;
        this.diveBomberInterval = Utils.randomInt(3000, 8000);
      }
    }
  }

  maybeShoot() {
    const now = Date.now();
    if (now - this.lastShotTime > this.shotInterval && this.aliens.length > 0) {
      const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
      const bulletX = shooter.x + shooter.width / 2;
      const bulletY = shooter.y + shooter.height;
      
      this.bullets.push(new AlienBullet(bulletX, bulletY));
      this.lastShotTime = now;
      
      this.shotInterval = Utils.randomInt(1500, 3000);
    }
  }

  checkCollision(bullet) {
    for (let alien of this.aliens) {
      if (Utils.rectCollision(bullet.getBounds(), alien.getBounds())) {
        return { type: 'alien', object: alien };
      }
    }
    
    for (let diveBomber of this.diveBombers) {
      if (Utils.rectCollision(bullet.getBounds(), diveBomber.getBounds())) {
        return { type: 'diveBomber', object: diveBomber };
      }
    }
    
    return null;
  }

  checkPlayerCollision(player) {
    for (let alien of this.aliens) {
      if (Utils.rectCollision(alien.getBounds(), player.getBounds())) {
        return true;
      }
    }
    
    for (let diveBomber of this.diveBombers) {
      if (Utils.rectCollision(diveBomber.getBounds(), player.getBounds())) {
        return true;
      }
    }
    
    return false;
  }

  removeAlien(alienToRemove) {
    this.aliens = this.aliens.filter(alien => alien !== alienToRemove);
  }

  removeDiveBomber(diveBomberToRemove) {
    this.diveBombers = this.diveBombers.filter(diveBomber => diveBomber !== diveBomberToRemove);
  }

  getBullets() {
    return this.bullets;
  }

  removeBullet(bulletToRemove) {
    this.bullets = this.bullets.filter(bullet => bullet !== bulletToRemove);
  }

  isEmpty() {
    return this.aliens.length === 0;
  }

  hasReachedBottom(canvasHeight) {
    return this.aliens.some(alien => alien.y + alien.height >= canvasHeight - 50);
  }

  increaseSpeed() {
    this.speed *= 1.2;
    this.shotInterval *= 0.9;
  }

  getDiveBombers() {
    return this.diveBombers;
  }

  draw(ctx) {
    this.aliens.forEach(alien => alien.draw(ctx));
    this.bullets.forEach(bullet => bullet.draw(ctx));
    this.diveBombers.forEach(diveBomber => diveBomber.draw(ctx));
  }
}