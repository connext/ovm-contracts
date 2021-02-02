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
const pbkdf2_1 = __importDefault(require("pbkdf2"));
const random_1 = require("./random");
const constants_1 = require("./constants");
function pbkdf2(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            pbkdf2_1.default.pbkdf2(password, random_1.randomBytes(constants_1.LENGTH_16), constants_1.LENGTH_1, constants_1.KEY_LENGTH, (err, key) => {
                if (err)
                    return reject(err);
                resolve(key);
            });
        });
    });
}
exports.pbkdf2 = pbkdf2;
//# sourceMappingURL=pbkdf2.js.map