"use strict";
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
class Game {
    constructor(diceConfigs) {
        this.dice = diceConfigs.map((config) => new Dice_1.Dice(config));
        this.probCalculator = new ProbabilityCalculator_1.ProbabilityCalculator();
    }
    generateFairDiceRoll(diceSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const computerNumber = (0, utils_1.getSecureRandomInt)(0, diceSize);
            const secretKey = (0, utils_1.generateSecureKey)();
            const hmac = (0, utils_1.generateHmac)(secretKey, computerNumber.toString());
            console.log(`HMAC: ${hmac}`);
            const userNumber = 0;
            console.log(`Computer number: ${computerNumber} (KEY=${secretKey})`);
            return (computerNumber + userNumber) % diceSize;
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
