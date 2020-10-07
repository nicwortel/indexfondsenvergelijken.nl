import {MutualFund} from "../src/Fund/MutualFund";
import {Index} from "../src/Index/Index";
import {Percentage} from "../src/Percentage";

export class FundFactory {
    private readonly index: Index;

    constructor() {
        this.index = new Index('Index', '', [], '');
    }

    public createMutualFund(totalExpenseRatio: number = 0.1, dividendLeak: number = 0.2): MutualFund {
        return new MutualFund(
            'Name',
            'SYM',
            'ISIN',
            '',
            new Percentage(totalExpenseRatio),
            new Percentage(dividendLeak),
            new Percentage(0),
            this.index,
            '',
            '',
            1
        );
    }
}
