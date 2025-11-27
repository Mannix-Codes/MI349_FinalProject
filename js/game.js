const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 30;

let playerX = canvas.width / 2;
let playerY = canvas.height - 10;
let playerHealth = 3;

let pause = false;

let mousepressed = false;

let fireballs = [];
let cooldownTimeStart = null;
const cooldownTime = 0.5; // seconds
const fireballRadius = 5;
const maxFireballs = 5;

let enemies = [];

let score = 0;

document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("mouseup", mouseUpHandler);


function mouseDownHandler(e) {
  mousepressed = true;
}

function mouseUpHandler(e) {
  mousepressed = false;
}

function mouseMoveHandler(e) {
  let pauseX = false;
  let pauseY = false;
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    playerX = relativeX;
  }
  else {pause = true;}
  let relativeY = e.clientY - canvas.offsetTop;
  if (relativeY > 0 && relativeY < canvas.height) {
    playerY = relativeY;
  }
  else {pauseY = true;}
  if (pauseX || pauseY) {
    pause = true;
  } else {
    pause = false;
  }
}


class Fireball {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.status = 1;
    this.radius = 5;
    this.speed = 1;

  }
}

class Enemy {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.health = 0;
  }
  

  attack() {
    // Enemy attack logic
  }
  move() {
    // Enemy movement logic
  }

  die() {
    if (this.health <= 0) {
      // Remove enemy from the game
      enemies = enemies.filter(enemy => enemy !== this);
    }
  }
}

class Water extends Enemy {
  constructor(x, y, vx, vy) {
    super(x, y, vx, vy);
    this.health = 1;
    this.speed = 1;
  }
  move() {
    // Water moves toward the player using atan2 (handles vertical/horizontal cases)
    const angle = Math.atan2(playerY - this.y, playerX - this.x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.x += this.vx;
    this.y += this.vy;
  }
}

class Spawner {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.spawnCooldown = 2; // seconds
    this.lastSpawnTime = Date.now();
  }
  spawn() {
    if (Date.now() - this.lastSpawnTime < this.spawnCooldown * 1000) {
      return;
    }
    this.lastSpawnTime = Date.now();
    let enemy = new Water(this.x, this.y, 0, 0);
    enemies.push(enemy);
  }
}

function collisionDetection() {
  // 1) Fireball vs enemy (rectangle) collisions
  for (let c = fireballs.length - 1; c >= 0; c--) {
    let fb = fireballs[c];
    for (let e = enemies.length - 1; e >= 0; e--) {
      let enemy = enemies[e];
      if (
        fb.x > enemy.x &&
        fb.x < enemy.x + 20 &&
        fb.y > enemy.y &&
        fb.y < enemy.y + 20
      ) {
        enemy.health -= 1;
        enemy.die();
        score+= 10;
        fb.status = 0;
        break; // this fireball is gone, move to next
      }
    }
  }

  // 2) Player vs enemy collisions — check every enemy regardless of fireballs
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    // enemy center (rect 20x20)
    const ex = enemy.x + 10;
    const ey = enemy.y + 10;
    const dx = playerX - ex;
    const dy = playerY - ey;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const enemyRadius = 10; // approximate
    if (dist < ballRadius + enemyRadius) {
      // damage player and remove enemy
      enemy.health -= 1;
      enemy.die();
      playerHealth -= 1;
      console.log('Player hit by enemy. Health:', playerHealth);
      if (playerHealth <= 0) {
        alert('GAME OVER');
        document.location.reload();
      }
    }
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(playerX, playerY, ballRadius, 0, Math.PI * 2);
  if (mousepressed) {
    ctx.fillStyle = "#FFA500";
  } else {
    ctx.fillStyle = "#0095DD";
  }
  ctx.fill();
  ctx.closePath();
}

function drawEnemy () {
  if (enemies.length > 0) {
    for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    enemy.move();
    ctx.beginPath();
    ctx.rect(enemy.x, enemy.y, 20, 20);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}}

const spawner = new Spawner();

function startAttack() {
  for (let i = 0; i < maxFireballs; i++) {
    let angle = (i / maxFireballs) * Math.PI * 2;
    let vx = Math.sin(angle);
    let vy = Math.cos(angle);
    fireballs.push(new Fireball(playerX, playerY, vx, vy));
  }
  // store start time in milliseconds
  cooldownTimeStart = Date.now();
}


function drawAttack() {
  if (fireballs.length === 0) return;
  for (let i = 0; i < fireballs.length; i++) {
    let fb = fireballs[i];
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fb.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFA500";
    ctx.fill();
    ctx.closePath();
    fb.x += fb.vx;
    fb.y += fb.vy;
    if (
      fb.x < 0 ||
      fb.x > canvas.width ||
      fb.y < 0 ||
      fb.y > canvas.height
    ) {
      fb.status = 0;
    }
  }
  fireballs = fireballs.filter(fb => fb.status === 1);
  // if lifetime (in seconds) has passed since the attack started, clear fireballs
  if (cooldownTimeStart !== null) {
    const elapsedSec = (Date.now() - cooldownTimeStart) / 1000;
    if (elapsedSec >= cooldownTime) {
      cooldownTimeStart = null;
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Score: ${score}`, 8, 20);
}
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Lives: ${playerHealth}`, canvas.width - 65, 20);
}
function draw() {
  if (!pause) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScore();
    drawLives();
    drawPlayer();
    drawAttack();
    drawEnemy();
    collisionDetection();
    spawner.spawn();
    if (mousepressed && cooldownTimeStart === null) {
      startAttack();
    }
  }
  // schedule next frame
  requestAnimationFrame(draw);
}


const runButton = document.getElementById("runButton");
runButton.addEventListener("click", function() {
  draw();
});