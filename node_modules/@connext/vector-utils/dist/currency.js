"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = void 0;
const constants_1 = require("@ethersproject/constants");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
class Currency {
    constructor(type, amount, daiRate) {
        this.typeToSymbol = {
            DAI: "$",
            DEI: "DEI ",
            ETH: constants_1.EtherSymbol,
            FIN: "FIN ",
            WEI: "WEI ",
        };
        this.defaultOptions = {
            DAI: { commas: false, decimals: 2, symbol: true, round: true },
            DEI: { commas: false, decimals: 0, symbol: false, round: true },
            ETH: { commas: false, decimals: 3, symbol: true, round: true },
            FIN: { commas: false, decimals: 3, symbol: false, round: true },
            WEI: { commas: false, decimals: 0, symbol: false, round: true },
        };
        this.getRate = (currency) => {
            const exchangeRates = {
                DAI: this.toRay(this.daiRate),
                DEI: this.toRay(units_1.parseUnits(this.daiRate, 18).toString()),
                ETH: this.toRay("1"),
                FIN: this.toRay(units_1.parseUnits("1", 3).toString()),
                GWEI: this.toRay(units_1.parseUnits("1", 9).toString()),
                WEI: this.toRay(units_1.parseUnits("1", 18).toString()),
            };
            if ((this.isEthType() && this.isEthType(currency)) ||
                (this.isTokenType() && this.isTokenType(currency))) {
                return exchangeRates[currency];
            }
            if (!this.daiRateGiven) {
                console.warn(`Provide DAI:ETH rate for accurate ${this.type} -> ${currency} conversions`);
                console.warn(`Using default eth price of $${this.daiRate} (amount: ${this.amount})`);
            }
            return exchangeRates[currency];
        };
        this.toDAI = (daiRate) => this._convert("DAI", daiRate);
        this.toDEI = (daiRate) => this._convert("DEI", daiRate);
        this.toETH = (daiRate) => this._convert("ETH", daiRate);
        this.toFIN = (daiRate) => this._convert("FIN", daiRate);
        this.toWEI = (daiRate) => this._convert("WEI", daiRate);
        this.toGWEI = (daiRate) => this._convert("GWEI", daiRate);
        this._convert = (targetType, daiRate) => {
            if (daiRate) {
                this.daiRate = daiRate;
                this.daiRateGiven = true;
            }
            const thisToTargetRate = this.toRay(this.getRate(targetType)).div(this.getRate(this.type));
            const targetAmount = this.fromRay(this.fromRoundRay(this.ray.mul(thisToTargetRate)));
            return new Currency(targetType, targetAmount.toString(), this.daiRateGiven ? this.daiRate : undefined);
        };
        this._round = (decStr) => this._floor(this.fromWad(this.toWad(decStr).add(this.toWad("0.5"))).toString());
        this._floor = (decStr) => decStr.substring(0, decStr.indexOf("."));
        this.toWad = (n) => units_1.parseUnits(n.toString(), 18);
        this.toRay = (n) => this.toWad(this.toWad(n.toString()));
        this.fromWad = (n) => units_1.formatUnits(n.toString(), 18);
        this.fromRoundRay = (n) => this._round(this.fromRay(n));
        this.fromRay = (n) => this.fromWad(this._round(this.fromWad(n.toString())));
        this.type = type;
        this.daiRate = typeof daiRate !== "undefined" ? daiRate : "1";
        this.daiRateGiven = !!daiRate;
        try {
            this.wad = this.toWad(amount._hex ? bignumber_1.BigNumber.from(amount._hex) : amount);
            this.ray = this.toRay(amount._hex ? bignumber_1.BigNumber.from(amount._hex) : amount);
        }
        catch (e) {
            throw new Error(`Invalid currency amount (${amount}): ${e}`);
        }
    }
    get amount() {
        return this.fromWad(this.wad);
    }
    get currency() {
        return {
            amount: this.amount,
            type: this.type,
        };
    }
    get symbol() {
        return this.typeToSymbol[this.type];
    }
    get floor() {
        return this._floor(this.amount);
    }
    toString() {
        return this.amount.slice(0, this.amount.indexOf("."));
    }
    isEthType(type) {
        return ["ETH", "FIN", "WEI"].includes(type || this.type);
    }
    isTokenType(type) {
        return ["DAI", "DEI"].includes(type || this.type);
    }
    toBN() {
        return bignumber_1.BigNumber.from(this._round(this.amount));
    }
    format(_options) {
        const amt = this.amount;
        const options = Object.assign(Object.assign({}, this.defaultOptions[this.type]), (_options || {}));
        const symbol = options.symbol ? `${this.symbol}` : "";
        const nDecimals = amt.length - amt.indexOf(".") - 1;
        const amount = options.round
            ? this.round(options.decimals)
            : options.decimals > nDecimals
                ? amt + "0".repeat(options.decimals - nDecimals)
                : options.decimals < nDecimals
                    ? amt.substring(0, amt.indexOf(".") + options.decimals + 1)
                    : amt;
        return `${symbol}${options.commas ? units_1.commify(amount) : amount}`;
    }
    round(decimals) {
        const amt = this.amount;
        const nDecimals = amt.length - amt.indexOf(".") - 1;
        if (typeof decimals === "number" && decimals > nDecimals) {
            return amt + "0".repeat(decimals - nDecimals);
        }
        if (typeof decimals === "number" && decimals < nDecimals) {
            const roundUp = bignumber_1.BigNumber.from(`5${"0".repeat(18 - decimals - 1)}`);
            const rounded = this.fromWad(this.wad.add(roundUp));
            return rounded.slice(0, amt.length - (nDecimals - decimals)).replace(/\.$/, "");
        }
        return this.amount;
    }
}
exports.Currency = Currency;
Currency.DAI = (amount, daiRate) => new Currency("DAI", amount, daiRate);
Currency.DEI = (amount, daiRate) => new Currency("DEI", amount, daiRate);
Currency.ETH = (amount, daiRate) => new Currency("ETH", amount, daiRate);
Currency.FIN = (amount, daiRate) => new Currency("FIN", amount, daiRate);
Currency.WEI = (amount, daiRate) => new Currency("WEI", amount, daiRate);
//# sourceMappingURL=currency.js.map