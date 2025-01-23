export class ProbabilityCalculator {
  calculateProbability(diceA: number[], diceB: number[]): number {
    let wins = 0;
    let total = 0;

    for (const a of diceA) {
      for (const b of diceB) {
        total++;
        if (a > b) wins++;
      }
    }

    return wins / total;
  }

  generateProbabilityTable(allDice: number[][]): number[][] {
    const n = allDice.length;
    const table = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          table[i][j] = this.calculateProbability(allDice[i], allDice[j]);
        }
      }
    }

    return table;
  }
}
