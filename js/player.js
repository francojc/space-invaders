class Player {
  constructor(x, y) {
    this.width = GameConfig.player.width;
    this.height = GameConfig.player.height;
    this.x = x - this.width / 2;
    this.y = y;
    this.speed = GameConfig.player.speed;
    this.color = GameConfig.player.color;
    
    this.lastShotTime = 0;
    this.shotCooldown = 250;
  }

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight(canvasWidth) {
    this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShotTime > this.shotCooldown) {
      const bulletX = this.x + this.width / 2 - GameConfig.bullet.width / 2;
      const bulletY = this.y;
      
      if (window.game) {
        window.game.bullets.push(new Bullet(bulletX, bulletY, -GameConfig.bullet.speed));
      }
      
      audioManager.playSound('shoot');
      this.lastShotTime = now;
    }
  }

  reset(x, y) {
    this.x = x - this.width / 2;
    this.y = y;
    this.lastShotTime = 0;
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
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width * 0.3, this.y + this.height);
    ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.7);
    ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
    ctx.lineTo(this.x + this.width * 0.7, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    const thrusterColor = `hsl(${Date.now() * 0.1 % 360}, 100%, 60%)`;
    ctx.fillStyle = thrusterColor;
    
    const thrusterHeight = 8 + Math.sin(Date.now() * 0.01) * 3;
    const leftThrusterX = this.x + this.width * 0.25;
    const rightThrusterX = this.x + this.width * 0.75;
    const thrusterY = this.y + this.height;
    
    ctx.beginPath();
    ctx.moveTo(leftThrusterX - 3, thrusterY);
    ctx.lineTo(leftThrusterX, thrusterY + thrusterHeight);
    ctx.lineTo(leftThrusterX + 3, thrusterY);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(rightThrusterX - 3, thrusterY);
    ctx.lineTo(rightThrusterX, thrusterY + thrusterHeight);
    ctx.lineTo(rightThrusterX + 3, thrusterY);
    ctx.fill();
    
    ctx.restore();
  }
}