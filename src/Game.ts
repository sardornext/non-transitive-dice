import { Dice } from './Dice';
import { generateHmac, getSecureRandomInt, generateSecureKey } from './utils';
import Table from 'cli-table3';
import chalk from 'chalk';
import { ProbabilityCalculator } from './ProbabilityCalculator';

export class Game {
  private dice: Dice[];
  private probCalculator: ProbabilityCalculator;

  constructor(diceConfigs: number[][]) {
    this.dice = diceConfigs.map((config) => new Dice(config));
    this.probCalculator = new ProbabilityCalculator();
  }

  async generateFairDiceRoll(diceSize: number): Promise<number> {
    const computerNumber = getSecureRandomInt(0, diceSize);
    const secretKey = generateSecureKey();
    const hmac = generateHmac(secretKey, computerNumber.toString());

    console.log(`HMAC: ${hmac}`);

    const userNumber = 0;

    console.log(`Computer number: ${computerNumber} (KEY=${secretKey})`);
    return (computerNumber + userNumber) % diceSize;
  }

  displayProbabilityTable(): void {
    console.log('\nProbability of winning for the user:');

    const table = new Table({
      head: [
        chalk.cyan('User dice v'),
        ...this.dice.map((d, i) => chalk.cyan(d.getFaces().join(','))),
      ],
    });

    const probs = this.probCalculator.generateProbabilityTable(
      this.dice.map((d) => d.getFaces())
    );

    probs.forEach((row, i) => {
      table.push([
        this.dice[i].getFaces().join(','),
        ...row.map((p, j) => (i === j ? `- (${p.toFixed(4)})` : p.toFixed(4))),
      ]);
    });

    console.log(table.toString());
    console.log(
      '\nNote: Values show the probability of the row dice winning against the column dice.'
    );
  }
}
