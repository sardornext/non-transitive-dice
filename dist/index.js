"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./Game");
const diceConfigs = process.argv
    .slice(2)
    .map((arg) => arg.split(',').map(Number));
if (diceConfigs.length < 3) {
    console.error('Please provide at least 3 dice configurations');
    process.exit(1);
}
const game = new Game_1.Game(diceConfigs);
game.displayProbabilityTable();
