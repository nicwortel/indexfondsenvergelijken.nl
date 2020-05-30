import {Fund} from "./Fund";
import {Money} from "bigint-money/dist";

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

    public describe(): string {
        return this.assets.map(({allocation, fund}) => allocation + '% ' + fund.symbol).join(', ');
    }
}
