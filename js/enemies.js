export class Enemy {
  constructor(x, y, vx = 0, vy = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.health = 0;
    this.dead = false;
  }

  attack() {
    // Enemy attack logic (no globals)
  }
  // move should be implemented by subclasses and accept target coordinates when needed
  move(targetX, targetY) {
    // default: simple translation
    this.x += this.vx;
    this.y += this.vy;
  }

  die() {
    // mark dead — caller should remove from enemies array
    if (this.health <= 0) this.dead = true;
  }
  // keep enemy within canvas bounds (20x20 size)
  keepOnScreen(width, height, score=0) {
    if (typeof width !== 'number' || typeof height !== 'number') return;
    if (this.x < 0) this.health = 0;
    if (this.y < 0) this.health = 0;
    if (this.x > width - 20) this.health = 0;
    if (this.y > height - 20) this.health = 0;
    score += 10;
    this.die();
  }

  draw(ctx) {
    // default draw method (override in subclasses)
    ctx.fillStyle = '#9E2A2B';
    ctx.fillRect(this.x, this.y, 20, 20);
  }
  /*
  keepOnScreen(width, height) {
    // keep enemy within canvas bounds
    if (this.x < 0) this.dead = true;
    if (this.y < 0) this.dead = true;
    if (this.x > width - 20) this.dead = true;
    if (this.y > height - 20) this.dead = true;
  }
    */
}

export class Water extends Enemy {
  constructor(x, y, vx = 0, vy = 0) {
    super(x, y, vx, vy);
    this.health = 1;
    this.speed = 1;
  }
  // move toward a target position provided by the game loop
  move(targetX, targetY) {
    if (typeof targetX === 'number' && typeof targetY === 'number') {
      const angle = Math.atan2(targetY - this.y, targetX - this.x);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.x += this.vx;
      this.y += this.vy;
    } else {
      // fallback to default movement
      super.move();
    }
  }
}

export class Air extends Enemy {
  constructor(x, y, vx = 0, vy = 0, targetX = 0, targetY = 0) {
    super(x, y, vx, vy);
    this.health = 10000000; // effectively infinite health
    this.speed = 2;
    this.targetX = targetX;
    this.targetY = targetY;
    let angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = '#E09F3E';
    ctx.fillRect(this.x, this.y, 20, 20);
  }
}

export class Earth extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.health = 3;
    this.speed = 0.5;
  }
  move() {
    this.x += 0;
    this.y += 0;
  }
  draw(ctx) {
    ctx.fillStyle = '#540B0E';
    ctx.fillRect(this.x, this.y, 20, 20);
  }
}

export class Spawner {
  constructor(x = 0, y = 0, spawnCooldown = 2, enemyType = Water, targetX = 0, targetY = 0, width = 100, height = 100) {
    this.x = x;
    this.y = y;
    this.spawnCooldown = spawnCooldown; // seconds
    this.lastSpawnTime = Date.now();
    this.enemyType = enemyType;
    this.targetX = targetX;
    this.targetY = targetY;
  }
  // returns a new enemy instance when spawning, or null if cooldown not elapsed
  spawn() {
    if (!this.enemyType) return null;
    else {
    if (Date.now() - this.lastSpawnTime < this.spawnCooldown * 1000) {
      return null;
    }
    this.lastSpawnTime = Date.now();
    if (this.enemyType === Air) {
      return new Air(this.x, this.y, 0, 0, this.targetX, this.targetY);
    }
    else if (this.enemyType === Earth) {
      let spotX = Math.random() * this.targetX;
      let spotY = Math.random() * this.targetY;
      return new Earth(spotX, spotY, 0, 0);
    } else {
      return new Water(this.x, this.y, 0, 0);
    }
  }
  }

  updateTarget(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
}