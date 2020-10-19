import {Money} from "bigint-money/dist";
import {Fund} from "./Fund/Fund";
import {Percentage} from "./Percentage";
import {Transaction} from "./Transaction";

export class Portfolio {
    constructor(public assets: { allocation: Percentage, fund: Fund }[]) {
        const totalAllocation = assets.reduce((
            sum: Percentage,
            current: { allocation: Percentage; fund: Fund }
        ) => sum.add(current.allocation), new Percentage(0));

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
        const costs = this.assets.map((asset: { allocation: Percentage; fund: Fund }): Percentage => asset.allocation.multiply(
            asset.fund.getTotalRecurringCosts()));

        return costs.reduce((sum: Percentage, current: Percentage) => sum.add(current));
    }

    public getMarketCapPercentage(): Percentage {
        return this.getFunds().reduce((
            previous: Percentage,
            current: Fund
        ) => previous.add(current.getMarketCapitalization()), new Percentage(0));
    }

    public getFundNames(): string[] {
        return this.getFunds().map((fund: Fund) => fund.getIdentifier());
    }

    public containsSmallCaps(): boolean {
        for (let asset of this.assets) {
            if (asset.fund.containsSmallCaps()) {
                return true;
            }
        }

        return false;
    }

    public containsOnlyEmergingMarketsSmallCaps(): boolean {
        const smallCapFunds = this.getFunds().filter((fund: Fund) => fund.containsSmallCaps());
        const developedSmallCapFunds = smallCapFunds.filter((fund: Fund) => fund.getTrackedIndex().markets === 'all-world' || fund.getTrackedIndex().markets === 'developed');

        return developedSmallCapFunds.length === 0;
    }

    public allocate(investment: Money): Transaction[] {
        return this.assets.map((asset: { allocation: Percentage; fund: Fund }) => new Transaction(
            asset.fund,
            asset.allocation.applyTo(investment)
        ));
    }

    public describe(): string {
        let developed: string[] = [];
        let emerging: string[] = [];

        for (let asset of this.assets) {
            let index = asset.fund.getTrackedIndex();

            if (index.markets == 'developed') {
                developed = developed.concat(index.sizes);
            } else if (index.markets == 'emerging') {
                emerging = emerging.concat(index.sizes);
            } else if (index.markets == 'all-world') {
                developed = developed.concat(index.sizes);
                emerging = emerging.concat(index.sizes);
            }
        }

        if (this.arraysEqual(developed, ['large', 'mid', 'small'])) {
            developed = ['all'];
        }
        if (this.arraysEqual(emerging, ['large', 'mid', 'small'])) {
            emerging = ['all'];
        }

        if (this.arraysEqual(developed, emerging)) {
            return 'all-world ' + developed.join(' & ') + ' cap';
        }

        return 'developed markets ' + developed.join(' & ') + ' cap + emerging markets ' + emerging.join(' & ') + ' cap';
    }

    private getFunds(): Fund[] {
        return this.assets.map((asset: { allocation: Percentage; fund: Fund }) => asset.fund);
    }

    private arraysEqual(array1: any[], array2: any[]): boolean {
        if (array1.length !== array2.length) {
            return false;
        }

        return array1.every((value, index: number) => value === array2[index]);
    }
}
