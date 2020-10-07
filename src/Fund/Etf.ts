import {Index} from "../Index/Index";
import {Percentage} from "../Percentage";
import {Fund} from "./Fund";

export class Etf implements Fund {
    constructor(
        private name: string,
        private symbol: string,
        private isin: string,
        private logo: string,
        private totalExpenseRatio: Percentage,
        private dividendLeak: Percentage,
        private index: Index,
        private kiid: string,
        private factsheet: string,
        private shares: number
    ) {
    }

    getName(): string {
        return this.name;
    }

    getIdentifier(): string {
        return this.symbol;
    }

    getIsin(): string {
        return this.isin;
    }

    getLogo(): string {
        return this.logo;
    }

    getTotalExpenseRatio(): Percentage {
        return this.totalExpenseRatio;
    }

    getDividendLeak(): Percentage {
        return this.dividendLeak;
    }

    getTotalRecurringCosts(): Percentage {
        return this.totalExpenseRatio.add(this.dividendLeak);
    }

    getEntryFee(): Percentage {
        return Percentage.createFromFraction(0);
    }

    getTrackedIndex(): Index {
        return this.index;
    }

    getKiid(): string {
        return this.kiid;
    }

    getFactsheet(): string {
        return this.factsheet;
    }

    containsSmallCaps(): boolean {
        return this.index.sizes.includes('small');
    }

    getNumberOfShares(): number {
        return this.shares;
    }
}
