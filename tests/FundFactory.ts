import {MutualFund} from "../src/Fund/MutualFund";
import {Index} from "../src/Index/Index";
import {Percentage} from "../src/Percentage";

export class FundFactory {
    public createMutualFund(
        totalExpenseRatio: number = 0.1,
        dividendLeak: number = 0.2,
        esgExclusionsPercentage: number = 0,
        indexMarketCapPercentage: number = 80
    ): MutualFund {
        const index = this.createIndex(indexMarketCapPercentage);

        return new MutualFund(
            'Name',
            'SYM',
            'ISIN',
            '',
            new Percentage(totalExpenseRatio),
            new Percentage(0),
            new Percentage(dividendLeak),
            index,
            '',
            '',
            new Percentage(esgExclusionsPercentage)
        );
    }

    private createIndex(marketCapPercentage: number): Index {
        return new Index('Index', '', '', [], new Percentage(marketCapPercentage), '');
    }
}
