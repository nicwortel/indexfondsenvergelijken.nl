import {FundFactory} from "../FundFactory";

const fundFactory = new FundFactory();

test('Returns the market capitalization percentage', () => {
    const fund = fundFactory.createMutualFund(0.1, 0.2, 5, 80);

    // 95% (100% - 5% ESG exclusions) of 80% of the total market cap
    expect(fund.getMarketCapitalization().getPercentage()).toBe(76);
});
