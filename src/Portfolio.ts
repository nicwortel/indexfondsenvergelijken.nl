import {Money} from "bigint-money/dist";
import {Fund} from "./Fund";

export class Portfolio {
    constructor(public assets: { allocation: number, fund: Fund }[]) {
        const totalAllocation = assets.reduce((sum: number, current) => sum + current.allocation, 0);

        if (totalAllocation !== 100) {
            throw new Error('The total allocation of all assets should be 100%');
        }
    }

    public getEntryCosts(amount: Money): Money {
        const costs = this.assets.map((asset) => (asset.allocation / 100) * asset.fund.entryFee);
        const cost = costs.reduce((sum: number, current: number) => sum + current);

        return amount.multiply(cost.toString());
    }

    public getTotalCosts(): number {
        const costs = this.assets.map((asset: { allocation: number; fund: Fund }) => (asset.allocation / 100) * asset.fund.getTotalCosts());

        return costs.reduce((sum: number, current: number) => sum + current);
    }

    public getFundNames(): string[] {
        return this.assets.map(function (asset): string {
            return asset.fund.symbol;
        })
    }

    public getNumberOfShares(): number {
        return this.assets.reduce((sum: number, current) => sum + current.fund.shares, 0);
    }

    public containsSmallCaps(): boolean {
        for (let asset of this.assets) {
            if (asset.fund.containsSmallCaps()) {
                return true;
            }
        }

        return false;
    }

    public allocate(amount: Money): Money[] {
        return this.assets.map((asset: { allocation: number; fund: Fund }): Money => amount.multiply(asset.allocation).divide(100));
    }

    public describe(): string {
        let markets: string[] = [];
        let sizes: string[] = [];
        let weighting: string = '';

        for (let asset of this.assets) {
            let index = asset.fund.index;

            markets = markets.concat(index.markets);
            sizes = sizes.concat(index.sizes);

            if (index.weighting !== undefined) {
                weighting = index.weighting;
            }
        }

        if (markets.includes('developed') && markets.includes('emerging')) {
            markets = ['all-world'];
        }

        markets = markets.map((markets: string) => markets.replace('developed', 'developed markets').replace('emerging', 'emerging markets'));

        if (sizes.includes('large') && sizes.includes('mid') && sizes.includes('small')) {
            sizes = ['all'];
        }

        function onlyUnique(value: string, index: number, self: string[]) {
            return self.indexOf(value) === index;
        }

        if (weighting !== '') {
            weighting = ' ' + weighting + ' weighted';
        }

        return markets.filter(onlyUnique).join(' ') + ' ' + sizes.filter(onlyUnique).join(' & ') + ' cap' + weighting;
    }
}
