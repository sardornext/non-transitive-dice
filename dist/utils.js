"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecureRandomInt = getSecureRandomInt;
exports.generateHmac = generateHmac;
exports.generateSecureKey = generateSecureKey;
exports.mod = mod;
const crypto_1 = require("crypto");
const config_1 = require("./config");
function getSecureRandomInt(min, max) {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValid = Math.floor(256 ** bytesNeeded / range) * range - 1;
    while (true) {
        const bytes = (0, crypto_1.randomBytes)(bytesNeeded);
        const value = bytes.reduce((acc, byte) => (acc << 8) + byte, 0);
        if (value <= maxValid) {
            return min + (value % range);
        }
    }
}
function generateHmac(key, message) {
    const hmac = (0, crypto_1.createHmac)('sha3-256', key);
    hmac.update(message);
    return hmac.digest('hex');
}
function generateSecureKey() {
    return (0, crypto_1.randomBytes)(config_1.SECRET_KEY_LENGTH).toString('hex');
}
// export function generateHmac(secretKey: string, message: string): string {
//   return createHmac('sha3-256', secretKey).update(message).digest('hex');
// }
// export function generateSecureKey(): string {
//   return randomBytes(SECRET_KEY_LENGTH).toString('hex');
// }
function mod(a, b) {
    return ((a % b) + b) % b;
}
