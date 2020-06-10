import {Index} from "./Index/Index";

export class Fund {
    constructor(
        public name: string,
        public symbol: string,
        public isin: string,
        public totalExpenseRatio: number,
        public dividendLeakage: number,
        public entryFee: number,
        public index: Index,
        public kiid: string,
        public factsheet: string,
        public shares: number
    ) {
    }

    public getTotalCosts(): number {
        return this.totalExpenseRatio + this.dividendLeakage;
    }
}
