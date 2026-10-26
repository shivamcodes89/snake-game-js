const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const finalScoreElement = document.querySelector("#final-score");
const timeElement = document.querySelector("#time");

const blockSize = 32;
const rows = Math.floor(board.clientHeight / blockSize);
const cols = Math.floor(board.clientWidth / blockSize);
const blocks = [];
let highScore = Number(localStorage.getItem("highScore")) || 0;
let score = 0;
let elapsedSeconds = 0;
let direction = "right";
let nextDirection = direction;
let snake = [];
let food;
let intervalId = null;
let timerIntervalId = null;
let isPlaying = false;

highScoreElement.innerText = highScore;
board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

for (let row = 0; row < rows; row += 1) {
  for (let col = 0; col < cols; col += 1) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function getRandomFood() {
  const availableCells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!snake.some((segment) => segment.x === row && segment.y === col)) {
        availableCells.push({ x: row, y: col });
      }
    }
  }

  return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function renderSnake() {
  snake.forEach((segment, index) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    block.classList.add(index === 0 ? "snake-head" : "snake-body");

    if (index === 0) {
      block.classList.add(`head-${direction}`);
      return;
    }

    if (index === snake.length - 1) {
      block.classList.add("snake-tail");
    }
  });
}

function clearSnake() {
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove(
      "snake-head",
      "snake-body",
      "snake-tail",
      "head-up",
      "head-right",
      "head-down",
      "head-left",
    );
  });
}

function updateTime() {
  elapsedSeconds += 1;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  timeElement.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function endGame() {
  isPlaying = false;
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
  finalScoreElement.innerText = score;
}

function render() {
  direction = nextDirection;
  const movement = {
    up: { x: -1, y: 0 },
    right: { x: 0, y: 1 },
    down: { x: 1, y: 0 },
    left: { x: 0, y: -1 },
  }[direction];
  const head = {
    x: snake[0].x + movement.x,
    y: snake[0].y + movement.y,
  };
  const ateFood = head.x === food.x && head.y === food.y;
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);

  if (
    head.x < 0 ||
    head.x >= rows ||
    head.y < 0 ||
    head.y >= cols ||
    bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    endGame();
    return;
  }

  clearSnake();
  snake.unshift(head);

  if (ateFood) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    score += 5;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.innerText = highScore;
      localStorage.setItem("highScore", highScore.toString());
    }

    food = getRandomFood();
    if (food) {
      blocks[`${food.x}-${food.y}`].classList.add("food");
    }
  } else {
    snake.pop();
  }

  if (!food) {
    endGame();
    return;
  }

  renderSnake();
}

function startGame() {
  if (isPlaying) {
    return;
  }

  isPlaying = true;
  modal.style.display = "none";
  intervalId = setInterval(render, 180);
  timerIntervalId = setInterval(updateTime, 1000);
}

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  clearSnake();
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  score = 0;
  elapsedSeconds = 0;
  direction = "right";
  nextDirection = direction;
  snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
  food = getRandomFood();

  scoreElement.innerText = score;
  timeElement.innerText = "00:00";
  highScoreElement.innerText = highScore;
  if (food) {
    blocks[`${food.x}-${food.y}`].classList.add("food");
  }
  renderSnake();

  modal.style.display = "none";
  isPlaying = false;
  startGame();
}

snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
food = getRandomFood();
if (food) {
  blocks[`${food.x}-${food.y}`].classList.add("food");
}
renderSnake();

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

const oppositeDirections = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

function changeDirection(newDirection) {
  if (newDirection && oppositeDirections[nextDirection] !== newDirection) {
    nextDirection = newDirection;
  }
}

window.addEventListener("keydown", (event) => {
  const keyDirections = {
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowLeft: "left",
    w: "up",
    d: "right",
    s: "down",
    a: "left",
    W: "up",
    D: "right",
    S: "down",
    A: "left",
  };
  const newDirection = keyDirections[event.key];

  if (newDirection) {
    event.preventDefault();
    changeDirection(newDirection);
  }
});

let touchStartX = 0;
let touchStartY = 0;

board.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true },
);

board.addEventListener(
  "touchend",
  (event) => {
    const diffX = event.changedTouches[0].clientX - touchStartX;
    const diffY = event.changedTouches[0].clientY - touchStartY;

    if (Math.max(Math.abs(diffX), Math.abs(diffY)) < 30) {
      return;
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      changeDirection(diffX > 0 ? "right" : "left");
    } else {
      changeDirection(diffY > 0 ? "down" : "up");
    }
  },
  { passive: true },
);
