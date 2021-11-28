import {Index} from "../Index/Index";
import {Percentage} from "../Percentage";
import {Fund} from "./Fund";

export class MutualFund implements Fund {
    constructor(
        private name: string,
        private identifier: string,
        private isin: string,
        private logo: string,
        private totalExpenseRatio: Percentage,
        private dividendLeak: Percentage,
        private index: Index,
        private kiid: string,
        private factsheet: string,
        private esgExclusions: Percentage
    )
    {
    }

    getName(): string {
        return this.name;
    }

    getIdentifier(): string {
        return this.identifier;
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

    getTrackedIndex(): Index {
        return this.index;
    }

    getKiid(): string {
        return this.kiid;
    }

    getFactsheet(): string {
        return this.factsheet;
    }

    getMarketCapitalization(): Percentage {
        const percentage = new Percentage(100).subtract(this.esgExclusions);

        return this.index.percentageOfTotalMarketCapitalization.multiply(percentage);
    }

    getEsgExclusions(): Percentage {
        return this.esgExclusions;
    }

    containsSmallCaps(): boolean {
        return this.index.sizes.includes('small');
    }
}
