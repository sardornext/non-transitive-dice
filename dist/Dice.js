"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dice = void 0;
class Dice {
    constructor(faces) {
        this.faces = faces;
    }
    getFaces() {
        return [...this.faces];
    }
    roll(randomValue) {
        return this.faces[randomValue % this.faces.length];
    }
}
exports.Dice = Dice;
