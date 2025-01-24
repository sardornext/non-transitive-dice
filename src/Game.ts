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

      const computerFirstMoveInput = getSecureRandomInt(0, 2);
      const firstMoveKey = generateSecureKey();
      const firstMoveHmac = generateHmac(
        firstMoveKey,
        computerFirstMoveInput.toString()
      );

      console.log(`HMAC: ${firstMoveHmac}`);
      console.log('Enter your choice for first move (0-1):');
      const userFirstMoveInput = parseInt(await this.getUserInput('> '));

      console.log(
        `Computer input: ${computerFirstMoveInput} (key: ${firstMoveKey})`
      );
      const combinedFirstMove =
        (computerFirstMoveInput + userFirstMoveInput) % 2;
      const isComputerFirst = combinedFirstMove === 1;

      let computerDice: Dice, playerDice: Dice;

      if (isComputerFirst) {
        const computerChoice = getSecureRandomInt(0, this.dice.length);
        computerDice = this.dice[computerChoice];
        console.log(`Computer chose: [${computerDice.getFaces().join(',')}]`);

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

      const computerRollInput = getSecureRandomInt(
        0,
        computerDice.getFaces().length
      );
      const computerRollKey = generateSecureKey();
      const computerRollHmac = generateHmac(
        computerRollKey,
        computerRollInput.toString()
      );

      console.log('\nComputer roll input:');
      console.log(`HMAC: ${computerRollHmac}`);

      console.log(
        'Enter your number for computer roll (0-' +
          (computerDice.getFaces().length - 1) +
          '):'
      );
      const userInputForComputerRoll = parseInt(await this.getUserInput('> '));

      const computerInputForPlayerRoll = getSecureRandomInt(
        0,
        playerDice.getFaces().length
      );
      const playerRollKey = generateSecureKey();
      const playerRollHmac = generateHmac(
        playerRollKey,
        computerInputForPlayerRoll.toString()
      );

      console.log('\nPlayer roll:');
      console.log(`HMAC: ${playerRollHmac}`);

      console.log(
        'Enter your number for your roll (0-' +
          (playerDice.getFaces().length - 1) +
          '):'
      );
      const userRollInput = parseInt(await this.getUserInput('> '));

      console.log(
        `Computer roll input: ${computerRollInput} (key: ${computerRollKey})`
      );
      console.log(
        `Computer input for player roll: ${computerInputForPlayerRoll} (key: ${playerRollKey})`
      );

      const finalComputerRoll =
        (computerRollInput + userInputForComputerRoll) %
        computerDice.getFaces().length;
      const finalPlayerRoll =
        (computerInputForPlayerRoll + userRollInput) %
        playerDice.getFaces().length;

      const computerValue = computerDice.roll(finalComputerRoll);
      const playerValue = playerDice.roll(finalPlayerRoll);

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
