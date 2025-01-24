"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Dice_1 = require("./Dice");
const utils_1 = require("./utils");
const cli_table3_1 = __importDefault(require("cli-table3"));
const chalk_1 = __importDefault(require("chalk"));
const ProbabilityCalculator_1 = require("./ProbabilityCalculator");
const readline = __importStar(require("readline"));
class Game {
    constructor(diceConfigs) {
        this.dice = diceConfigs.map((config) => new Dice_1.Dice(config));
        this.probCalculator = new ProbabilityCalculator_1.ProbabilityCalculator();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    getUserInput(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.rl.question(prompt, (answer) => {
                    resolve(answer);
                });
            });
        });
    }
    displayMenu(options, hmac) {
        if (hmac) {
            console.log(`HMAC: ${hmac}`);
        }
        options.forEach((option, index) => {
            console.log(`${index} - ${option}`);
        });
        console.log('? - help');
        console.log('0 - exit');
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Let's determine who makes the first move.");
                // First move determination
                const computerFirstMove = (0, utils_1.getSecureRandomInt)(0, 2);
                const firstMoveKey = (0, utils_1.generateSecureKey)();
                const firstMoveHmac = (0, utils_1.generateHmac)(firstMoveKey, computerFirstMove.toString());
                console.log(`HMAC: ${firstMoveHmac}`);
                console.log('Enter your choice (0-1):');
                const userFirstMove = parseInt(yield this.getUserInput('> '));
                console.log(`Computer move: ${computerFirstMove} (key: ${firstMoveKey})`);
                const isComputerFirst = (computerFirstMove + userFirstMove) % 2 === 1;
                // Dice selection phase
                let computerDice, playerDice;
                if (isComputerFirst) {
                    const computerChoice = (0, utils_1.getSecureRandomInt)(0, this.dice.length);
                    computerDice = this.dice[computerChoice];
                    console.log(`Computer chose: [${computerDice.getFaces().join(',')}]`);
                    // Player selects dice
                    console.log('\nAvailable dice:');
                    this.dice.forEach((dice, index) => {
                        if (index !== computerChoice) {
                            console.log(`${index} - [${dice.getFaces().join(',')}]`);
                        }
                    });
                    const playerChoice = parseInt(yield this.getUserInput('Select your dice (0-' + (this.dice.length - 1) + '): '));
                    playerDice = this.dice[playerChoice];
                }
                else {
                    // Player selects first
                    console.log('\nAvailable dice:');
                    this.dice.forEach((dice, index) => {
                        console.log(`${index} - [${dice.getFaces().join(',')}]`);
                    });
                    const playerChoice = parseInt(yield this.getUserInput('Select your dice (0-' + (this.dice.length - 1) + '): '));
                    playerDice = this.dice[playerChoice];
                    // Computer selects from remaining dice
                    const availableDice = this.dice.filter((d) => d !== playerDice);
                    computerDice =
                        availableDice[(0, utils_1.getSecureRandomInt)(0, availableDice.length)];
                    console.log(`Computer chose: [${computerDice.getFaces().join(',')}]`);
                }
                // Rolling phase
                // Computer roll
                const computerRollNum = (0, utils_1.getSecureRandomInt)(0, computerDice.getFaces().length);
                const computerRollKey = (0, utils_1.generateSecureKey)();
                const computerRollHmac = (0, utils_1.generateHmac)(computerRollKey, computerRollNum.toString());
                console.log('\nComputer roll:');
                console.log(`HMAC: ${computerRollHmac}`);
                // Player roll
                console.log('Enter your number (0-' + (playerDice.getFaces().length - 1) + '):');
                const playerRollNum = parseInt(yield this.getUserInput('> '));
                // Reveal results
                console.log(`Computer number: ${computerRollNum} (key: ${computerRollKey})`);
                const computerValue = computerDice.roll(computerRollNum);
                const playerValue = playerDice.roll(playerRollNum);
                console.log(`\nComputer rolled: ${computerValue}`);
                console.log(`You rolled: ${playerValue}`);
                if (computerValue > playerValue) {
                    console.log(chalk_1.default.red('Computer wins!'));
                }
                else if (playerValue > computerValue) {
                    console.log(chalk_1.default.green('You win!'));
                }
                else {
                    console.log(chalk_1.default.yellow("It's a tie!"));
                }
            }
            finally {
                this.rl.close();
            }
        });
    }
    displayProbabilityTable() {
        console.log('\nProbability of winning for the user:');
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.cyan('User dice v'),
                ...this.dice.map((d, i) => chalk_1.default.cyan(d.getFaces().join(','))),
            ],
        });
        const probs = this.probCalculator.generateProbabilityTable(this.dice.map((d) => d.getFaces()));
        probs.forEach((row, i) => {
            table.push([
                this.dice[i].getFaces().join(','),
                ...row.map((p, j) => (i === j ? `- (${p.toFixed(4)})` : p.toFixed(4))),
            ]);
        });
        console.log(table.toString());
        console.log('\nNote: Values show the probability of the row dice winning against the column dice.');
    }
}
exports.Game = Game;
