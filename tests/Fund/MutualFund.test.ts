import {MutualFund} from "../../src/Fund/MutualFund";
import {Index} from "../../src/Index/Index";
import {Percentage} from "../../src/Percentage";
import {FundFactory} from "../FundFactory";

const fundFactory = new FundFactory();

test('Returns the total fund costs', () => {
    const index = new Index('Index', '', '', [], new Percentage(0), '');
    const fund = new MutualFund(
        'Name',
        'SYM',
        'ISIN',
        '',
        new Percentage(0.1),
        new Percentage(0.2),
        new Percentage(0),
        index,
        '',
        '',
        new Percentage(0)
    );

    expect(fund.getTotalRecurringCosts().getPercentage()).toBeCloseTo(0.3);
});

test('Returns the market capitalization percentage', () => {
    const fund = fundFactory.createMutualFund(0.1, 0.2, 0, 5, 80);

    // 95% (100% - 5% ESG exclusions) of 80% of the total market cap
    expect(fund.getMarketCapitalization().getPercentage()).toBe(76);
});
