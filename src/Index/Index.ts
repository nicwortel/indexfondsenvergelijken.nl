export class Index {
    constructor(
        public name: string,
        public markets: string,
        public sizes: string[]
    ) {
    }

    public describe(): string {
        let markets = this.markets;
        let sizes = this.sizes;

        if (markets === 'developed' || markets === 'emerging') {
            markets += ' markets';
        }

        if (sizes.includes('large') && sizes.includes('mid') && sizes.includes('small')) {
            sizes = ['all'];
        }

        return markets + ' ' + sizes.join(' & ') + ' cap';
    }
}
