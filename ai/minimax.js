import { checkMiniWinner } from './utils.js';

const MAX_DEPTH = 4; // You can tweak this value later

function minimax(boardState, winners, currentPlayer, activeBoard, depth = 0, isMax = true) {
  const opponent = currentPlayer === "X" ? "O" : "X";

  // Check super board winner
  const superWinner = checkMiniWinner(winners);
  if (superWinner === currentPlayer) return { score: 100 - depth };
  if (superWinner === opponent) return { score: depth - 100 };

  // Check draw
  if (winners.every(w => w)) return { score: 0 };

  if (depth >= MAX_DEPTH) return { score: 0 };

  let bestScore = isMax ? -Infinity : Infinity;
  let bestMove = null;

  const validBoards = activeBoard === -1
    ? boardState.map((b, i) => (!winners[i] && b.includes(null) ? i : -1)).filter(i => i !== -1)
    : [activeBoard];

  for (let boardIndex of validBoards) {
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      if (boardState[boardIndex][cellIndex] !== null) continue;

      // Clone board state
      const newBoard = boardState.map(b => [...b]);
      const newWinners = [...winners];

      // Make move
      newBoard[boardIndex][cellIndex] = currentPlayer;
      const winner = checkMiniWinner(newBoard[boardIndex]);
      if (winner) newWinners[boardIndex] = winner;

      // Determine next active board
      const nextBoard = (newWinners[cellIndex] || newBoard[cellIndex].every(c => c !== null))
        ? -1
        : cellIndex;

      const result = minimax(
        newBoard,
        newWinners,
        opponent,
        nextBoard,
        depth + 1,
        !isMax
      );

      if (isMax && result.score > bestScore) {
        bestScore = result.score;
        bestMove = { boardIndex, cellIndex };
      }

      if (!isMax && result.score < bestScore) {
        bestScore = result.score;
        bestMove = { boardIndex, cellIndex };
      }
    }
  }

  return bestMove ? { ...bestMove, score: bestScore } : { score: 0 };
}

export function getBestMove(boardState, winners, currentPlayer, activeBoard) {
  const best = minimax(boardState, winners, currentPlayer, activeBoard);
  return best;
}

