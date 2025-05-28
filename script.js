import { superBoardState, boardWinners, resetBoardState } from './ai/state.js';
import { getBestMove } from './ai/minimax.js';

const gameContainer = document.getElementById("game");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");

  

let currentPlayer = "X";
let boards = []; // 9 small boards
let activeBoard = -1; // -1 means all boards are playable

// Create the 9 small boards
for (let i = 0; i < 9; i++) {
  const board = document.createElement("div");
  board.classList.add("board");
  board.dataset.board = i;

  let cells = [];
  for (let j = 0; j < 9; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.cell = j;
    cell.dataset.board = i;

    cell.addEventListener("click", handleClick);

    board.appendChild(cell);
    cells.push(cell);
  }

  gameContainer.appendChild(board);
  boards.push({ element: board, cells, winner: null });
}

function handleClick(e) {
    const cell = e.target;
    const boardIndex = parseInt(cell.dataset.board);
    const cellIndex = parseInt(cell.dataset.cell);
  
    // Check if move is allowed
    if (
      cell.textContent !== "" ||
      (activeBoard !== -1 && boardIndex !== activeBoard) ||
      boards[boardIndex].winner ||
      activeBoard === -2 // game over
    ) {
      return;
    }
  
    // Set mark
    cell.textContent = currentPlayer;
    superBoardState[boardIndex][cellIndex] = currentPlayer;

  
    // Check if this mini board is now won
    const winner = checkWinner(boards[boardIndex].cells);
    if (winner) {
      boards[boardIndex].winner = winner;
      boards[boardIndex].element.classList.add(winner === "X" ? "won-x" : "won-o");
      boards[boardIndex].cells.forEach(c => c.classList.add("won"));
    }
  
    // Check for Super Board win
    const overallWinner = checkSuperWinner();
    if (overallWinner) {
      if (overallWinner === "Draw") {
        statusText.textContent = "It's a draw!";
      } else {
        statusText.textContent = `🏆 Player ${overallWinner} wins the game!`;
      }
      activeBoard = -2; // Lock the game
      updateActiveBoards();
      return;
    }
  
    // Determine next active board
    if (boards[cellIndex].winner || isBoardFull(boards[cellIndex])) {
      activeBoard = -1; // Any board allowed
    } else {
      activeBoard = cellIndex; // Lock to that board
    }
  
    updateActiveBoards();
  
    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
  
    // Update status
    statusText.innerHTML = currentPlayer === "X"
      ? "<span style='color:blue'>🔷 Player X's Turn</span>"
      : "<span style='color:red'>🔴 Player O's Turn</span>";
  
    // Let AI play if it's AI's turn
    if (currentPlayer === "O") {
      setTimeout(() => {
        playAI();
      }, 300);
    }
  }
  

  function isBoardFull(board) {
    return board.cells.every(cell => cell.textContent !== "");
  }
  

  function updateActiveBoards() {
    boards.forEach((b, i) => {
      if (activeBoard === -2) {
        b.element.classList.remove("active"); // Game over
      } else if (activeBoard === -1 || i === activeBoard) {
        b.element.classList.add("active");
      } else {
        b.element.classList.remove("active");
      }
    });
  }
  
  
  restartBtn.addEventListener("click", () => {
    currentPlayer = "X";
    activeBoard = -1;
    statusText.textContent = `Player X's Turn`;
    boards.forEach(board => {
      board.winner = null;
      board.element.classList.remove("won-x", "won-o", "active");
      board.cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("won");
      });
    });
    updateActiveBoards();
    superBoardState = Array.from({ length: 9 }, () => Array(9).fill(null));
    boardWinners = Array(9).fill(null);

  });
  
  function minimax(board, isMaximizing) {
    const winner = checkWinner(board.cells);
    if (winner === "X") return { score: -1 };
    if (winner === "O") return { score: 1 };
    if (isBoardFull(board)) return { score: 0 };
  
    let bestMove;
    if (isMaximizing) {
      let bestScore = -Infinity;
      board.cells.forEach((cell, idx) => {
        if (cell.textContent === "") {
          cell.textContent = "O"; // AI plays
          const result = minimax(board, false);
          cell.textContent = "";
          if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = idx;
          }
        }
      });
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      board.cells.forEach((cell, idx) => {
        if (cell.textContent === "") {
          cell.textContent = "X"; // Human plays
          const result = minimax(board, true);
          cell.textContent = "";
          if (result.score < bestScore) {
            bestScore = result.score;
            bestMove = idx;
          }
        }
      });
      return { score: bestScore, move: bestMove };
    }
  }
  
  
  function checkWinner(cells) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
  
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        cells[a].textContent &&
        cells[a].textContent === cells[b].textContent &&
        cells[a].textContent === cells[c].textContent
      ) {
        return cells[a].textContent; // Return "X" or "O"
      }
    }
    return null;
  }
  
  function checkSuperWinner() {
    const superBoard = boards.map(b => b.winner);
  
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
  
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        superBoard[a] &&
        superBoard[a] === superBoard[b] &&
        superBoard[a] === superBoard[c]
      ) {
        return superBoard[a]; // "X" or "O"
      }
    }
  
    // Optional: Check draw
    if (superBoard.every(winner => winner)) {
      return "Draw";
    }
  
    return null;
  }
  
  function playAI() {
    if (activeBoard === -2) return;
  
    const best = getBestMove(superBoardState, boardWinners, currentPlayer, activeBoard);
  
    if (best) {
      const { boardIndex, cellIndex } = best;
      const board = boards[boardIndex];
      const cell = board.cells[cellIndex];
      if (cell && cell.textContent === "") {
        cell.click(); // Simulate the move
      }
    }
  }
  
  