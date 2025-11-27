const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 30;

let playerX = canvas.width / 2;
let playerY = canvas.height - 10;

let pause = false;

let mousepressed = false;

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
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    pause = false;
    playerX = relativeX;
  }
  else {pause = true;}
  let relativeY = e.clientY - canvas.offsetTop;
  if (relativeY > 0 && relativeY < canvas.height) {
    pause = false;
    playerY = relativeY;
  }
  else {pause = true;}
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(playerX, playerY, ballRadius, 0, Math.PI * 2);
  if (mousepressed) {
    ctx.fillStyle = "#FF0000";
  } else {
    ctx.fillStyle = "#0095DD";
  }
  ctx.fill();
  ctx.closePath();
}

let fireballs = [];
let fireballTimeStart = null;
const lifetime = 5; // seconds
const fireballRadius = 5;
const fireballSpeed = 1;
const maxFireballs = 5;

function startAttack() {
  for (let i = 0; i < maxFireballs; i++) {
    let angle = (i / maxFireballs) * Math.PI * 2;
    let vx = fireballSpeed * Math.cos(angle);
    let vy = fireballSpeed * Math.sin(angle);
    fireballs.push({ x: playerX, y: playerY, vx: vx, vy: vy, status: 1 });
  }
  fireballTimeStart = Date.now().getSeconds();
}

function drawAttack() {
  if (fireballs.length === 0) return;
  for (let i = 0; i < fireballs.length; i++) {
    let fb = fireballs[i];
    ctx.beginPath();
    ctx.arc(fb.x, fb.y, fireballRadius, 0, Math.PI * 2);
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
  if (Date.now().getSeconds() - fireballTimeStart >= lifetime) {
    fireballs = [];
  }
}

function draw() {
  if (!pause) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawAttack();
    if (mousepressed && fireballs.length === 0) { {
      startAttack();
    }
  }
}
  requestAnimationFrame(draw);
}


const runButton = document.getElementById("runButton");
runButton.addEventListener("click", function() {
  draw();
});