export class Fund {
    constructor(
        public name: string,
        public symbol: string,
        public isin: string,
        public totalExpenseRatio: number,
        public dividendLeakage: number
    ) {
    }

    public getTotalCosts(): number {
        return this.totalExpenseRatio + this.dividendLeakage;
    }
}
