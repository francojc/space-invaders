const Utils = {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  },

  circleCollision(circle1, circle2) {
    const distance = this.distance(circle1.x, circle1.y, circle2.x, circle2.y);
    return distance < circle1.radius + circle2.radius;
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  updateScore(newScore) {
    const scoreElement = document.getElementById('score-value');
    scoreElement.textContent = newScore.toLocaleString();
    scoreElement.classList.add('celebration');
    setTimeout(() => {
      scoreElement.classList.remove('celebration');
    }, 600);
  },

  updateLives(lives) {
    const livesElement = document.getElementById('lives-value');
    livesElement.textContent = lives;
    if (lives <= 2) {
      livesElement.style.color = '#f44336';
      livesElement.style.animation = 'glow 1s ease-in-out infinite alternate';
    } else {
      livesElement.style.color = '#4caf50';
      livesElement.style.animation = 'none';
    }
  },

  showMessage(title, text, buttonText = null, callback = null) {
    const messageDiv = document.getElementById('game-message');
    const titleElement = document.getElementById('message-title');
    const textElement = document.getElementById('message-text');
    const buttonElement = document.getElementById('start-button');

    titleElement.textContent = title;
    textElement.textContent = text;

    if (buttonText && callback) {
      buttonElement.textContent = buttonText;
      buttonElement.style.display = 'block';
      buttonElement.onclick = callback;
    } else {
      buttonElement.style.display = 'none';
    }

    messageDiv.classList.remove('hidden');
    messageDiv.classList.add('fade-in');
  },

  hideMessage() {
    const messageDiv = document.getElementById('game-message');
    messageDiv.classList.add('hidden');
    messageDiv.classList.remove('fade-in');
  },

  getRandomExplosionColor() {
    const colors = ['#FFD700', '#FF6347', '#FF69B4', '#00CED1', '#98FB98'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  createParticle(x, y, color = '#FFD700', size = 3, velocity = { x: 0, y: 0 }) {
    return {
      x: x,
      y: y,
      color: color,
      size: size,
      velocity: velocity,
      life: 1.0,
      decay: 0.02
    };
  },

  updateParticle(particle) {
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
    particle.life -= particle.decay;
    particle.size *= 0.99;
    return particle.life > 0;
  },

  drawParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

const GameConfig = {
  canvas: {
    width: 800,
    height: 600
  },
  
  player: {
    width: 40,
    height: 30,
    speed: 5,
    color: '#00BFFF'
  },
  
  bullet: {
    width: 4,
    height: 10,
    speed: 7,
    color: '#FFFF00'
  },
  
  alien: {
    width: 30,
    height: 25,
    rows: 3,
    cols: 8,
    spacing: 45,
    speed: 0.5,
    dropDistance: 20,
    speedIncrease: 0.3,
    shootIntervalDecrease: 0.15
  },
  
  diveBomber: {
    width: 25,
    height: 20,
    speed: 2,
    spawnChance: 0.002,
    maxActive: 2,
    pointValue: 200
  },
  
  game: {
    maxLives: 5,
    pointsPerAlien: 100,
    bonusThreshold: 1000
  }
};