import {Index} from "./Index/Index";
import {Percentage} from "./Percentage";

export class Fund {
    constructor(
        public name: string,
        public symbol: string,
        public isin: string,
        public logo: string,
        public totalExpenseRatio: Percentage,
        public dividendLeakage: Percentage,
        public entryFee: Percentage,
        public index: Index,
        public kiid: string,
        public factsheet: string,
        public shares: number
    ) {
    }

    public getTotalCosts(): Percentage {
        return this.totalExpenseRatio.add(this.dividendLeakage);
    }

    public containsSmallCaps(): boolean {
        return this.index.sizes.includes('small');
    }
}
