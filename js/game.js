import { Enemy, Water, Air, Spawner, Earth } from './enemies.js';

let interval = null;
const height = 3* screen.width/ 12;
const width = 4*screen.width/12;

const canvas = document.getElementById("myCanvas");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
// load player sprite from images folder; adjust path if your sprite is elsewhere
const playerImage = new Image();
let playerImageLoaded = false;
playerImage.onload = () => { playerImageLoaded = true; };
playerImage.onerror = () => { console.warn('Player sprite failed to load:', playerImage.src); };
// default sprite — change to your desired file
// path is relative to the HTML page that loads this script; when opening `_pages/game.html` use the ../ path
playerImage.src = '../images/game/flame_flicker.gif';
const ballRadius = 10;

let x = canvas.width / 4;
let y = canvas.height / 3;

let playerX = canvas.width / 2;
let playerY = canvas.height - 10;
let playerHealth = 3;

let pause = true;

let mousepressed = false;

let fireballs = [];
let cooldownTimeStart = null;
const cooldownTime = 1; // seconds
const fireballRadius = 5;
const maxFireballs = 5;

let tutorial = true;
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
    this.alive = true;
    this.radius = 5;
    this.speed = 1;
    this.lifetime = 3; // seconds
    this.creationTime = Date.now();
  }

  fizzle() {
    if (this.alive) {
      const elapsedSec = (Date.now() - this.creationTime) / 1000;
      if (elapsedSec >= this.lifetime) {
        this.alive = false;
      }
    }
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
        score += 10;
        // mark this fireball dead
        fb.alive = false;
        break; // this fireball is gone, move to next
      }
    }
  }

  // 2) Player vs enemy collisions — check every enemy regardless of fireballs
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.keepOnScreen(canvas.width, canvas.height, score);
    // enemy center (rect 20x20)
    const ex = enemy.x + 10;
    const ey = enemy.y + 10;
    const dx = playerX - ex;
    const dy = playerY - ey;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const enemyRadius = 10; // approximate
    if (dist < ballRadius + enemyRadius) {
      // damage player and remove enemy
      enemy.health = 0;
      enemy.die();
      playerHealth -= 1;
      console.log('Player hit by enemy. Health:', playerHealth);
      if (playerHealth <= 0) {
        alert('GAME OVER');
        clearInterval(interval);
        document.location.reload();
      }
    }
  }
  // remove any enemies that were marked dead
  enemies = enemies.filter(en => !en.dead);
  // remove dead fireballs immediately so they don't persist until next frame
  fireballs = fireballs.filter(fb => fb.alive);
}

function drawPlayer() {
  //if (playerImageLoaded) {
    // center sprite on player coordinates
  //  ctx.drawImage(playerImage, playerX-ballRadius * 2, playerY-ballRadius * 2, ballRadius * 5, ballRadius * 5);
  //} else {
    // fallback while image is loading
    ctx.beginPath();
    ctx.arc(playerX, playerY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#335c67";
    ctx.fill();
    ctx.closePath();
  //}
  
}

function drawEnemy () {
  if (enemies.length > 0) {
    for (let i = 0; i < enemies.length; i++) {
      let enemy = enemies[i];
      // pass player position so enemy can move toward the player
      enemy.move(playerX, playerY);
      ctx.beginPath();
      ctx.rect(enemy.x, enemy.y, 20, 20);
      enemy.draw(ctx);
      ctx.closePath();
    }
}}

let spawners = []
// create spawner at canvas center
function roundHandler(round) {
  switch (round) {
    case 0:
      enemies.push(new Water(canvas.width/2, canvas.height/2))
      tutorial = false;
      break;
    case 1:
      spawners = [];
      spawners.push(new Spawner(canvas.width / 2, canvas.height / 2, 1));
      break;
    case 2:
      spawners = [];
      spawners.push(new Spawner(canvas.width / 2, canvas.height / 2, 2, Air, playerX, playerY));
      spawners.push(new Spawner(canvas.width / 2, canvas.height / 2, 2, Earth, playerX, playerY));
      break;
    case 3:
      spawners = [];
      spawners.push(new Spawner(canvas.width / 4, canvas.height / 2, 2));
      spawners.push(new Spawner(3 * canvas.width / 4, canvas.height / 2, 2));
      break;
    case 4:
      spawners = [];
      spawners.push(new Spawner(canvas.width / 4, canvas.height / 4, 3));
      spawners.push(new Spawner(3 * canvas.width / 4, 3 * canvas.height / 4, 3));
      spawners.push(new Spawner(canvas.width / 2, canvas.height / 2, 2, Air, playerX, playerY));
      spawners.push(new Spawner(canvas.width / 2, canvas.height / 2, 2, Earth, playerX, playerY));
      break;

  }

}

function startAttack() {
  for (let i = 0; i < maxFireballs; i++) {
    let angle = ((i/ maxFireballs)-(Math.random()/maxFireballs)) * Math.PI*2;
    let vx = Math.sin(angle);
    let vy = Math.cos(angle);
    fireballs.push(new Fireball(playerX, playerY, vx, vy));
  }
  // store start time in milliseconds
  cooldownTimeStart = Date.now();
}


function drawAttack() {
  if (fireballs.length === 0) return;
  // update and draw each fireball using methods on the class-like object
  for (let i = 0; i < fireballs.length; i++) {
    let fb = fireballs[i];
    if (!fb.alive) continue;
    // update position
    fb.x += fb.vx * fb.speed;
    fb.y += fb.vy * fb.speed;
    // draw
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fb.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFA500";
    ctx.fill();
    ctx.closePath();
    // offscreen check
    if (fb.x < 0 || fb.x > canvas.width || fb.y < 0 || fb.y > canvas.height) {
      fb.alive = false;
    }
    fb.fizzle();
  }
  // keep only alive fireballs
  fireballs = fireballs.filter(fb => fb.alive);
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

function drawTutorial () {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Move With Your Mouse", canvas.width/2, canvas.height/4);
  ctx.fillText("Click to Explode", canvas.width/2, 2*canvas.height/4);
  ctx.fillText("Avoid Red", canvas.width/2, 3*canvas.height/4);
}

function tutorialRound() {
  if (spawners.length <= 0 && !tutorial && enemies.length === 0) {
    roundHandler(3);
  }
  else if (enemies.length <= 0 && tutorial){
    roundHandler(0);
  }
  if (!pause) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTutorial();
    drawScore();
    drawLives();
    drawPlayer();
    drawAttack();
    drawEnemy();
    collisionDetection();
    // attempt to spawn; if a new enemy is returned, add to our enemies array
    for (let spawner of spawners) {
      const spawned = spawner.spawn();
      if (spawned) enemies.push(spawned);
    }
    if (mousepressed && cooldownTimeStart === null) {
      startAttack();
    }
  }
  if (score >= 100) {
    if (score % 100 !== 0) {
      return;
    }
    if (score % 4 === 0) {
      roundHandler(4);
    }
    else if (score %3 === 0) {
      roundHandler(3);
    }
    else if (score % 2 === 0) {
      roundHandler(2);
    }
    else if (score % 100 === 0) {
      roundHandler(1);
    }
    
  }
  // schedule next frame
}


function fixedUpdate() {
  spawners.forEach(spawner => {
    spawner.updateTarget(playerX, playerY);
  });
  tutorialRound();
  /*
  if (spawners.length <= 0 && !tutorial && enemies.length === 0) {
    roundHandler(1);
  }
  else if (enemies.length <= 0){
    roundHandler(0);
  }
  if (!pause) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTutorial();
    drawScore();
    drawLives();
    drawPlayer();
    drawAttack();
    drawEnemy();
    collisionDetection();
    // attempt to spawn; if a new enemy is returned, add to our enemies array
    for (let spawner of spawners) {
      const spawned = spawner.spawn();
      if (spawned) enemies.push(spawned);
    }
    if (mousepressed && cooldownTimeStart === null) {
      startAttack();
    }
  }
  if (score >= 100 && spawners.length === 1) {
    roundHandler(2);
  }
  // schedule next frame
  */
}


const runButton = document.getElementById("runButton");
runButton.addEventListener("click", function() {
  interval = setInterval(fixedUpdate, 16);
});