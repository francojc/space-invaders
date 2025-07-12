class Bullet {
  constructor(x, y, velocityY, color = GameConfig.bullet.color) {
    this.x = x;
    this.y = y;
    this.width = GameConfig.bullet.width;
    this.height = GameConfig.bullet.height;
    this.velocityY = velocityY;
    this.color = color;
    this.trail = [];
    this.maxTrailLength = 5;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    
    this.y += this.velocityY;
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
    
    for (let i = 0; i < this.trail.length; i++) {
      const trailPoint = this.trail[i];
      const alpha = (i + 1) / this.trail.length * 0.3;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(
        trailPoint.x - this.width / 4, 
        trailPoint.y, 
        this.width / 2, 
        this.height / 2
      );
    }
    
    ctx.globalAlpha = 1;
    
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}

class AlienBullet extends Bullet {
  constructor(x, y) {
    super(x, y, GameConfig.bullet.speed, '#FF4444');
    this.width = 3;
    this.height = 8;
  }

  draw(ctx) {
    ctx.save();
    
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, '#FF4444');
    gradient.addColorStop(0.5, '#FF8888');
    gradient.addColorStop(1, '#FFAAAA');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.shadowColor = '#FF4444';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}