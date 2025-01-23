"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const cli_table3_1 = __importDefault(require("cli-table3"));
console.log('Welcome to the Non-Transitive Dice Game!');
const secretKey = 'mySecretKey';
const computerChoice = Math.floor(Math.random() * 6);
const hmac = (0, crypto_1.createHmac)('sha3-256', secretKey)
    .update(computerChoice.toString())
    .digest('hex');
console.log("Computer's HMAC:", hmac);
const table = new cli_table3_1.default({
    head: ['Dice 1', 'Dice 2', 'Dice 3'],
});
table.push(['-', '0.5556', '0.4444'], ['0.4444', '-', '0.5556'], ['0.5556', '0.4444', '-']);
console.log(table.toString());
