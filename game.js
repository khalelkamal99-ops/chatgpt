const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const restartBtn = document.getElementById("restart");

const road = {
  x: canvas.width * 0.2,
  width: canvas.width * 0.6,
};

const car = {
  x: canvas.width / 2,
  y: canvas.height - 120,
  width: 40,
  height: 70,
  speed: 6,
};

const state = {
  score: 0,
  level: 1,
  running: true,
  obstacles: [],
  keys: {
    left: false,
    right: false,
    up: false,
    down: false,
  },
};

const obstacleColors = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#577590"];

function resetGame() {
  state.score = 0;
  state.level = 1;
  state.running = true;
  state.obstacles = [];
  car.x = canvas.width / 2;
  car.y = canvas.height - 120;
  for (let i = 0; i < 4; i += 1) {
    spawnObstacle(-i * 160);
  }
}

function spawnObstacle(offsetY = -80) {
  const width = 40 + Math.random() * 30;
  const height = 50 + Math.random() * 40;
  const x = road.x + Math.random() * (road.width - width);
  const speed = 2 + state.level * 0.6 + Math.random();
  const color = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
  state.obstacles.push({ x, y: offsetY, width, height, speed, color });
}

function drawRoad() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(road.x, 0, road.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.setLineDash([18, 24]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCar() {
  ctx.fillStyle = "#1d3557";
  ctx.fillRect(car.x - car.width / 2, car.y, car.width, car.height);
  ctx.fillStyle = "#f1faee";
  ctx.fillRect(car.x - car.width / 4, car.y + 12, car.width / 2, 20);
  ctx.fillStyle = "#a8dadc";
  ctx.fillRect(car.x - car.width / 6, car.y + 40, car.width / 3, 18);
}

function drawObstacles() {
  state.obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

function updateCar() {
  if (state.keys.left) {
    car.x -= car.speed;
  }
  if (state.keys.right) {
    car.x += car.speed;
  }
  if (state.keys.up) {
    car.y -= car.speed;
  }
  if (state.keys.down) {
    car.y += car.speed;
  }

  const minX = road.x + car.width / 2;
  const maxX = road.x + road.width - car.width / 2;
  car.x = Math.max(minX, Math.min(maxX, car.x));
  car.y = Math.max(40, Math.min(canvas.height - car.height - 20, car.y));
}

function updateObstacles() {
  state.obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed;
  });

  state.obstacles = state.obstacles.filter((obstacle) => obstacle.y < canvas.height + 60);

  while (state.obstacles.length < 5) {
    spawnObstacle();
  }
}

function checkCollisions() {
  return state.obstacles.some((obstacle) => {
    const carLeft = car.x - car.width / 2;
    const carRight = car.x + car.width / 2;
    const carTop = car.y;
    const carBottom = car.y + car.height;

    const obsLeft = obstacle.x;
    const obsRight = obstacle.x + obstacle.width;
    const obsTop = obstacle.y;
    const obsBottom = obstacle.y + obstacle.height;

    return carLeft < obsRight && carRight > obsLeft && carTop < obsBottom && carBottom > obsTop;
  });
}

function updateScore() {
  state.score += 1;
  if (state.score % 500 === 0) {
    state.level += 1;
  }
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
}

function drawOverlay() {
  if (state.running) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f1faee";
  ctx.font = "24px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Kaza!", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText("Yeniden başlatmak için butona bas.", canvas.width / 2, canvas.height / 2 + 20);
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  updateCar();
  updateObstacles();
  drawObstacles();
  drawCar();

  if (state.running) {
    if (checkCollisions()) {
      state.running = false;
    } else {
      updateScore();
    }
  }

  drawOverlay();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    state.keys.left = true;
  }
  if (event.key === "ArrowRight") {
    state.keys.right = true;
  }
  if (event.key === "ArrowUp") {
    state.keys.up = true;
  }
  if (event.key === "ArrowDown") {
    state.keys.down = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    state.keys.left = false;
  }
  if (event.key === "ArrowRight") {
    state.keys.right = false;
  }
  if (event.key === "ArrowUp") {
    state.keys.up = false;
  }
  if (event.key === "ArrowDown") {
    state.keys.down = false;
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

resetGame();
tick();
