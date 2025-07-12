class CollisionDetector {
  static bulletAlienCollision(bullet, alien) {
    return Utils.rectCollision(bullet.getBounds(), alien.getBounds());
  }

  static bulletPlayerCollision(bullet, player) {
    return Utils.rectCollision(bullet.getBounds(), player.getBounds());
  }

  static alienPlayerCollision(alien, player) {
    return Utils.rectCollision(alien.getBounds(), player.getBounds());
  }

  static circleRectCollision(circle, rect) {
    const closestX = Utils.clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = Utils.clamp(circle.y, rect.y, rect.y + rect.height);
    
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.radius * circle.radius);
  }

  static pointInRect(x, y, rect) {
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
  }

  static lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (denominator === 0) {
      return false;
    }
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  static getCollisionNormal(rect1, rect2) {
    const centerX1 = rect1.x + rect1.width / 2;
    const centerY1 = rect1.y + rect1.height / 2;
    const centerX2 = rect2.x + rect2.width / 2;
    const centerY2 = rect2.y + rect2.height / 2;
    
    const dx = centerX2 - centerX1;
    const dy = centerY2 - centerY1;
    
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) {
      return { x: 0, y: -1 };
    }
    
    return {
      x: dx / length,
      y: dy / length
    };
  }

  static separateRects(rect1, rect2) {
    const overlapX = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - 
                    Math.max(rect1.x, rect2.x);
    const overlapY = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - 
                    Math.max(rect1.y, rect2.y);
    
    if (overlapX < overlapY) {
      if (rect1.x < rect2.x) {
        rect1.x -= overlapX / 2;
        rect2.x += overlapX / 2;
      } else {
        rect1.x += overlapX / 2;
        rect2.x -= overlapX / 2;
      }
    } else {
      if (rect1.y < rect2.y) {
        rect1.y -= overlapY / 2;
        rect2.y += overlapY / 2;
      } else {
        rect1.y += overlapY / 2;
        rect2.y -= overlapY / 2;
      }
    }
  }

  static broadPhaseCheck(obj1, obj2, threshold = 100) {
    const centerX1 = obj1.x + obj1.width / 2;
    const centerY1 = obj1.y + obj1.height / 2;
    const centerX2 = obj2.x + obj2.width / 2;
    const centerY2 = obj2.y + obj2.height / 2;
    
    const distance = Utils.distance(centerX1, centerY1, centerX2, centerY2);
    return distance < threshold;
  }

  static checkAllCollisions(bullets, aliens, player) {
    const collisions = [];
    
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      
      for (let j = aliens.length - 1; j >= 0; j--) {
        const alien = aliens[j];
        
        if (this.broadPhaseCheck(bullet, alien, 50) && 
            this.bulletAlienCollision(bullet, alien)) {
          collisions.push({
            type: 'bullet-alien',
            bullet: bullet,
            alien: alien,
            bulletIndex: i,
            alienIndex: j
          });
        }
      }
      
      if (this.bulletPlayerCollision(bullet, player)) {
        collisions.push({
          type: 'bullet-player',
          bullet: bullet,
          player: player,
          bulletIndex: i
        });
      }
    }
    
    for (let alien of aliens) {
      if (this.alienPlayerCollision(alien, player)) {
        collisions.push({
          type: 'alien-player',
          alien: alien,
          player: player
        });
      }
    }
    
    return collisions;
  }
}