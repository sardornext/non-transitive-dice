import { Game } from './Game';

const diceConfigs = process.argv
  .slice(2)
  .map((arg) => arg.split(',').map(Number));

if (diceConfigs.length < 3) {
  console.error('Please provide at least 3 dice configurations');
  process.exit(1);
}

const game = new Game(diceConfigs);

if (process.argv.includes('?') || process.argv.includes('--help')) {
  game.displayProbabilityTable();
} else {
  game.play().catch(console.error);
}
