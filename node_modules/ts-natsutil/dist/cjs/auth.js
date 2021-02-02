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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const defaultIssuer = 'ts-natsutil';
const defaultSigningAlgorithm = 'RS256';
class AuthService {
    constructor(log, audience, privateKey, publicKey) {
        this.audience = audience;
        this.log = log;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }
    vendBearerJWT(subject, ttl, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a, _b;
                const claims = {
                    nats: {
                        permissions: permissions,
                    },
                };
                const signer = { key: this.privateKey };
                const options = {
                    algorithm: defaultSigningAlgorithm,
                    audience: this.audience,
                    subject: subject,
                    issuer: defaultIssuer,
                    expiresIn: ttl,
                };
                try {
                    const token = jwt.sign(claims, signer, options);
                    (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`Signed ${token.length}-byte bearer authorization token for subject: ${subject}`);
                    resolve(token);
                }
                catch (err) {
                    (_b = this.log) === null || _b === void 0 ? void 0 : _b.debug(`Failed to vend NATS bearer JWT for subject: ${subject}; ${err}`);
                    reject(err);
                }
            });
        });
    }
    verifyBearerJWT(token) {
        let verified = false;
        jwt.verify(token, this.publicKey, { algorithms: [defaultSigningAlgorithm] }, (err) => {
            var _a;
            if (err) {
                (_a = this.log) === null || _a === void 0 ? void 0 : _a.debug(`NATS bearer JWT verification failed; ${err}`);
                verified = false;
            }
        });
        return verified;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map