import {Broker} from "./Broker";
import {Fund} from "./Fund/Fund";
import {Percentage} from "./Percentage";

export class Portfolio {
    constructor(public assets: { allocation: Percentage, fund: Fund }[], public brokers: Broker[]) {
    }

    public getMarketCapPercentage(): Percentage {
        return this.getFunds().reduce((
            previous: Percentage,
            current: Fund
        ) => previous.add(current.getMarketCapitalization()), new Percentage(0));
    }

    public getFundNames(): string[] {
        return this.assets.map((asset) => asset.fund.getIdentifier());
    }

    public getYearlyCosts(expectedDividend: Percentage): Percentage {
        return this.assets.reduce((sum: Percentage, asset) => {
            const fund = asset.fund;
            const fundCosts = fund.getTotalExpenseRatio()
                .add(fund.getInternalTransactionCosts())
                .add(fund.getDividendLeak().multiply(expectedDividend));

            return sum.add(asset.allocation.multiply(fundCosts));
        }, new Percentage(0));
    }

    public getTotalExpenseRatio(): Percentage {
        return this.assets.reduce((
            sum: Percentage,
            asset
        ) => sum.add(asset.allocation.multiply(asset.fund.getTotalExpenseRatio())), new Percentage(0));
    }

    public getDividendLeak(): Percentage {
        return this.assets.reduce((
            sum: Percentage,
            asset
        ) => sum.add(asset.allocation.multiply(asset.fund.getDividendLeak())), new Percentage(0));
    }

    private getFunds(): Fund[] {
        return this.assets.map((asset) => asset.fund);
    }
}
