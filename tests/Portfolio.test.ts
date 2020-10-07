import {Money} from "bigint-money";
import {Percentage} from "../src/Percentage";
import {Portfolio} from "../src/Portfolio";
import {Transaction} from "../src/Transaction";
import {FundFactory} from "./FundFactory";

const fundFactory = new FundFactory();
const dummyFund = fundFactory.createMutualFund();

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

test('Allocates an investment sum to the funds', () => {
    const portfolio = new Portfolio([
        {
            allocation: new Percentage(88),
            fund: dummyFund
        },
        {
            allocation: new Percentage(12),
            fund: dummyFund
        }
    ]);

    expect(portfolio.allocate(new Money(200, 'EUR'))).toEqual([
        new Transaction(dummyFund, new Money(176, 'EUR')),
        new Transaction(dummyFund, new Money(24, 'EUR'))
    ]);
});
