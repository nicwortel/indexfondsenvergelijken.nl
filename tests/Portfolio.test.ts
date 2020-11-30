import {Money} from "bigint-money";
import {Fund} from "../src/Fund/Fund";
import {Percentage} from "../src/Percentage";
import {Portfolio} from "../src/Portfolio";
import {Transaction} from "../src/Transaction";
import {FundFactory} from "./FundFactory";

const fundFactory = new FundFactory();
const dummyFund = fundFactory.createMutualFund();

function createPortfolio(fund: Fund): Portfolio {
    return new Portfolio([
        {
            allocation: new Percentage(88),
            fund: fund
        },
        {
            allocation: new Percentage(12),
            fund: fund
        }
    ]);
}

test('Fails if the total allocation of assets is not 100%', () => {
    expect(() => new Portfolio([
        {
            allocation: new Percentage(50), fund: dummyFund
        },
        {
            allocation: new Percentage(49), fund: dummyFund
        }
    ])).toThrow(Error);
});

test('Grows in value when investments are made', () => {
    const portfolio = createPortfolio(dummyFund);

    portfolio.invest(new Money(1000, 'EUR'));
    portfolio.invest(new Money(2000, 'EUR'));

    expect(portfolio.getValue()).toStrictEqual(new Money(3000, 'EUR'));
});

test('Subtracts entry fees from investment', () => {
    const fund = fundFactory.createMutualFund(0, 0, 0.1);
    const portfolio = createPortfolio(fund);

    portfolio.invest(new Money(1000, 'EUR'));

    expect(portfolio.getValue()).toStrictEqual(new Money(999, 'EUR'));
    expect(portfolio.getTotalEntryCosts()).toStrictEqual(new Money(1, 'EUR'));
});

test('Grows in value over time', () => {
    const portfolio = createPortfolio(dummyFund);

    portfolio.invest(new Money(1000, 'EUR'));
    portfolio.grow(new Percentage(5), new Percentage(1));

    expect(portfolio.getValue()).toStrictEqual(new Money(1050, 'EUR'));
    expect(portfolio.getTotalRunningCosts()).toStrictEqual(new Money(10, 'EUR'));
});

test('Returns dividend', () => {
    const fund = fundFactory.createMutualFund(0.1, 0);
    const portfolio = createPortfolio(fund);

    portfolio.invest(new Money(1000, 'EUR'));
    const dividend = portfolio.collectDividends(new Percentage(0.625));

    expect(dividend).toStrictEqual(new Money('6.25', 'EUR'));
});

test('Returns dividend after subtracting the dividend leakage', () => {
    const fund = fundFactory.createMutualFund(0.1, 1);
    const portfolio = createPortfolio(fund);

    portfolio.invest(new Money(1000, 'EUR'));
    const dividend = portfolio.collectDividends(new Percentage(1));

    expect(dividend).toStrictEqual(new Money('9.9', 'EUR'));
    expect(portfolio.getTotalDividendLeakage()).toStrictEqual(new Money('0.1', 'EUR'));
});

test('Can be reset', () => {
    const portfolio = createPortfolio(dummyFund);

    portfolio.invest(new Money(1000, 'EUR'));
    portfolio.reset();

    expect(portfolio.getValue()).toStrictEqual(new Money(0, 'EUR'));
});

test('Allocates an investment sum to the funds', () => {
    const portfolio = createPortfolio(dummyFund);

    expect(portfolio.allocate(new Money(200, 'EUR'))).toEqual([
        new Transaction(dummyFund, new Money(176, 'EUR')),
        new Transaction(dummyFund, new Money(24, 'EUR'))
    ]);
});

test('Returns the sum of market capitalization percentages of the underlying indices', () => {
    const portfolio = new Portfolio([
        {
            allocation: new Percentage(88),
            fund: fundFactory.createMutualFund(0.1, 0.2, 0, 5, 80)
        },
        {
            allocation: new Percentage(12),
            fund: fundFactory.createMutualFund(0.1, 0.2, 0, 10, 15)
        }
    ]);

    // (80% * 95%) + (15% * 90%)
    expect(portfolio.getMarketCapPercentage().getPercentage()).toBe(89.5);
});
