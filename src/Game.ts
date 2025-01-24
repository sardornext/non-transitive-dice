import { Dice } from './Dice';
import { generateHmac, getSecureRandomInt, generateSecureKey } from './utils';
import Table from 'cli-table3';
import chalk from 'chalk';
import { ProbabilityCalculator } from './ProbabilityCalculator';
import * as readline from 'readline';
export class Game {
  private dice: Dice[];
  private probCalculator: ProbabilityCalculator;
  private rl: readline.Interface;
  constructor(diceConfigs: number[][]) {
    this.dice = diceConfigs.map((config) => new Dice(config));
    this.probCalculator = new ProbabilityCalculator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private async getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  private displayMenu(options: string[], hmac?: string): void {
    if (hmac) {
      console.log(`HMAC: ${hmac}`);
    }
    options.forEach((option, index) => {
      console.log(`${index} - ${option}`);
    });
    console.log('? - help');
    console.log('0 - exit');
  }

  async play(): Promise<void> {
    try {
      console.log("Let's determine who makes the first move.");

      // First move determination
      const computerFirstMove = getSecureRandomInt(0, 2);
      const firstMoveKey = generateSecureKey();
      const firstMoveHmac = generateHmac(
        firstMoveKey,
        computerFirstMove.toString()
      );

      console.log(`HMAC: ${firstMoveHmac}`);
      console.log('Enter your choice (0-1):');
      const userFirstMove = parseInt(await this.getUserInput('> '));

      console.log(`Computer move: ${computerFirstMove} (key: ${firstMoveKey})`);
      const isComputerFirst = (computerFirstMove + userFirstMove) % 2 === 1;

      // Dice selection phase
      let computerDice: Dice, playerDice: Dice;

      if (isComputerFirst) {
        const computerChoice = getSecureRandomInt(0, this.dice.length);
        computerDice = this.dice[computerChoice];
        console.log(`Computer chose: [${computerDice.getFaces().join(',')}]`);

        // Player selects dice
        console.log('\nAvailable dice:');
        this.dice.forEach((dice, index) => {
          if (index !== computerChoice) {
            console.log(`${index} - [${dice.getFaces().join(',')}]`);
          }
        });

        const playerChoice = parseInt(
          await this.getUserInput(
            'Select your dice (0-' + (this.dice.length - 1) + '): '
          )
        );
        playerDice = this.dice[playerChoice];
      } else {
        // Player selects first
        console.log('\nAvailable dice:');
        this.dice.forEach((dice, index) => {
          console.log(`${index} - [${dice.getFaces().join(',')}]`);
        });

        const playerChoice = parseInt(
          await this.getUserInput(
            'Select your dice (0-' + (this.dice.length - 1) + '): '
          )
        );
        playerDice = this.dice[playerChoice];

        // Computer selects from remaining dice
        const availableDice = this.dice.filter((d) => d !== playerDice);
        computerDice =
          availableDice[getSecureRandomInt(0, availableDice.length)];
        console.log(`Computer chose: [${computerDice.getFaces().join(',')}]`);
      }

      // Rolling phase
      // Computer roll
      const computerRollNum = getSecureRandomInt(
        0,
        computerDice.getFaces().length
      );
      const computerRollKey = generateSecureKey();
      const computerRollHmac = generateHmac(
        computerRollKey,
        computerRollNum.toString()
      );

      console.log('\nComputer roll:');
      console.log(`HMAC: ${computerRollHmac}`);

      // Player roll
      console.log(
        'Enter your number (0-' + (playerDice.getFaces().length - 1) + '):'
      );
      const playerRollNum = parseInt(await this.getUserInput('> '));

      // Reveal results
      console.log(
        `Computer number: ${computerRollNum} (key: ${computerRollKey})`
      );

      const computerValue = computerDice.roll(computerRollNum);
      const playerValue = playerDice.roll(playerRollNum);

      console.log(`\nComputer rolled: ${computerValue}`);
      console.log(`You rolled: ${playerValue}`);

      if (computerValue > playerValue) {
        console.log(chalk.red('Computer wins!'));
      } else if (playerValue > computerValue) {
        console.log(chalk.green('You win!'));
      } else {
        console.log(chalk.yellow("It's a tie!"));
      }
    } finally {
      this.rl.close();
    }
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
