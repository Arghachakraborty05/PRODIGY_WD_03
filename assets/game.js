const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const winLine = document.getElementById("winLine");

// Get player names and mode
const playerX = localStorage.getItem("player1") || "Player 1";
const playerO = localStorage.getItem("player2") || "Player 2";
const mode = localStorage.getItem("mode") || "MULTI"; // "AI" or "MULTI"

function formatTurnName(name) {
  return name === "You" ? "Your" : `${name}'s`;
}

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let running = true;

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Initial status
statusText.textContent = `${formatTurnName(playerX)} Turn`;

// Event Listeners
cells.forEach(cell => cell.addEventListener("click", cellClicked));
restartBtn.addEventListener("click", restartGame);

function cellClicked() {
  const index = this.dataset.index;
  if (board[index] !== "" || !running || (mode === "AI" && currentPlayer === "O")) return;

  makeMove(index, currentPlayer);

  if (mode === "AI" && running && currentPlayer === "O") {
    setTimeout(aiMove, 400); // Slight delay
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player === "X" ? "orange" : "cyan");
  checkWinner();
}

function checkWinner() {
  for (let i = 0; i < winConditions.length; i++) {
    const [a, b, c] = winConditions[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      endGame(true, i);
      return;
    }
  }

  if (!board.includes("")) {
    endGame(false);
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    const currentName = currentPlayer === "X" ? playerX : playerO;
    statusText.textContent = `${formatTurnName(currentName)} Turn`;
  }
}

function endGame(won, winIndex = null) {
  running = false;

  let result;
  let score;
  const date = new Date().toLocaleString();

  if (won) {
    const winnerName = currentPlayer === "X" ? playerX : playerO;
    const loserName = currentPlayer === "X" ? playerO : playerX;
    statusText.textContent = `${winnerName} Won!`;
    drawWinLine(winIndex, currentPlayer);
    result = {
      playerX: playerX,
      playerO: playerO,
      score: currentPlayer === "X" ? "1-0" : "0-1",
      date: date,
    };

  } else {
    statusText.textContent = "It's a Draw!";
    result = {
      playerX: playerX,
      playerO: playerO,
      score: "0-0",
      date: date,
    };

  }

  saveToLeaderboard(result);
}

function saveToLeaderboard(result) {
  // Get recent matches or initialize
  let recentMatches = JSON.parse(localStorage.getItem("leaderboard")) || [];

  // Add new match at the beginning
  recentMatches.unshift(result);

  // Keep only the latest 10
  if (recentMatches.length > 10) {
    recentMatches = recentMatches.slice(0, 10);
  }

  // Save only the latest 10
  localStorage.setItem("leaderboard", JSON.stringify(recentMatches));
}




function drawWinLine(index, player) {
  const positions = [
    { top: 17, left: 50, width: 100, rotate: 0 },
    { top: 50.7, left: 50, width: 100, rotate: 0 },
    { top: 84, left: 50, width: 100, rotate: 0 },
    { top: 50, left: 16.4, width: 100, rotate: 90 },
    { top: 50, left: 49.6, width: 100, rotate: 90 },
    { top: 50, left: 83.38, width: 100, rotate: 90 },
    { top: 50, left: 50, width: 135, rotate: 45 },
    { top: 50, left: 50, width: 135, rotate: -45 },
  ];

  const { top, left, width, rotate } = positions[index];
  setLine(top, left, width, rotate);

  winLine.classList.remove("orange", "cyan");
  winLine.classList.add(player === "X" ? "orange" : "cyan");
}

function setLine(topPercent, leftPercent, widthPercent, rotateDeg) {
  winLine.style.top = `${topPercent}%`;
  winLine.style.left = `${leftPercent}%`;
  winLine.style.width = `${widthPercent}%`;
  winLine.style.height = `20px`;
  winLine.style.transform = `translate(-50%, -50%) rotate(${rotateDeg}deg)`;
  winLine.style.opacity = 1;
  winLine.classList.add("animated");
}

function restartGame() {
  board.fill("");
  currentPlayer = "X";
  running = true;
  statusText.textContent = `${formatTurnName(playerX)} Turn`;


  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("orange", "cyan");
  });

  winLine.style.opacity = 0;
  winLine.style.width = "0%";
  winLine.classList.remove("animated", "orange", "cyan");

  if (mode === "AI" && currentPlayer === "O") {
    setTimeout(aiMove, 400);
  }
}

// =====================
//   SMART IMPERFECT AI 
// =====================

function aiMove() {
  const chance = Math.random();

  if (chance > 0.02) {
    const bestMove = getBestMove();
    makeMove(bestMove, "O");
  } else {
    const imperfectMove = getImperfectMove();
    makeMove(imperfectMove, "O");
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

function getImperfectMove() {
  const empty = board
    .map((val, idx) => (val === "" ? idx : null))
    .filter(idx => idx !== null);

  const best = getBestMove();
  const imperfectOptions = empty.filter(i => i !== best);

  if (imperfectOptions.length > 0) {
    return imperfectOptions[Math.floor(Math.random() * imperfectOptions.length)];
  }

  return best; // Fallback
}

function minimax(newBoard, depth, isMaximizing) {
  const result = evaluateBoard(newBoard);
  if (result !== null) return result;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        const score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        const score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function evaluateBoard(b) {
  for (let [a, bIdx, c] of winConditions) {
    if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
      return b[a] === "O" ? 1 : -1;
    }
  }

  if (!b.includes("")) return 0;
  return null;
}

// Reset win line on page load
window.addEventListener("DOMContentLoaded", () => {
  winLine.style.opacity = 0;
  winLine.style.width = "0%";
  winLine.classList.remove("animated", "orange", "cyan");
});


