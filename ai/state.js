export let superBoardState = Array.from({ length: 9 }, () => Array(9).fill(null));
export let boardWinners = Array(9).fill(null);

export function resetBoardState() {
  superBoardState = Array.from({ length: 9 }, () => Array(9).fill(null));
  boardWinners = Array(9).fill(null);
}
