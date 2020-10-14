import {Money} from "bigint-money/dist";
import {Fund} from "./Fund/Fund";
import {Percentage} from "./Percentage";
import {Transaction} from "./Transaction";

export class Portfolio {
    constructor(public assets: { allocation: Percentage, fund: Fund }[]) {
        const totalAllocation = assets.reduce((sum: Percentage, current: { allocation: Percentage; fund: Fund }) => sum.add(current.allocation), new Percentage(0));

        if (!totalAllocation.equals(new Percentage(100))) {
            throw new Error('The total allocation of all assets should be 100%');
        }
    }

    public getEntryCosts(amount: Money): Money {
        const costs = this.assets.map((asset: { allocation: Percentage; fund: Fund }) => asset.allocation.multiply(asset.fund.getEntryFee()));
        const cost = costs.reduce((sum: Percentage, current: Percentage) => sum.add(current));

        return cost.applyTo(amount);
    }

    public getTotalCosts(): Percentage {
        const costs = this.assets.map((asset: { allocation: Percentage; fund: Fund }): Percentage => asset.allocation.multiply(asset.fund.getTotalRecurringCosts()));

        return costs.reduce((sum: Percentage, current: Percentage) => sum.add(current));
    }

    public getMarketCapPercentage(): Percentage {
        return this.assets.reduce((
            previous: Percentage,
            current: { allocation: Percentage; fund: Fund }
        ) => previous.add(current.fund.getMarketCapitalization()), new Percentage(0));
    }

    public getFundNames(): string[] {
        return this.assets.map(function (asset): string {
            return asset.fund.getIdentifier();
        });
    }

    public getNumberOfShares(): number {
        return this.assets.reduce((sum: number, current) => sum + current.fund.getNumberOfShares(), 0);
    }

    public containsSmallCaps(): boolean {
        for (let asset of this.assets) {
            if (asset.fund.containsSmallCaps()) {
                return true;
            }
        }

        return false;
    }

    public allocate(investment: Money): Transaction[] {
        return this.assets.map((asset: { allocation: Percentage; fund: Fund }) => new Transaction(asset.fund, asset.allocation.applyTo(investment)));
    }

    public describe(): string {
        let markets: string[] = [];
        let sizes: string[] = [];
        let weighting: string = '';

        for (let asset of this.assets) {
            let index = asset.fund.getTrackedIndex();

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
