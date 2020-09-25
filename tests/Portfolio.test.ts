import {Money} from "bigint-money";
import {Fund} from "../src/Fund";
import {Index} from "../src/Index/Index";
import {Portfolio} from "../src/Portfolio";

const dummyFund = new Fund(
    'Dummy Fund',
    'DUM',
    'NL123',
    'foo',
    0.001,
    0,
    0,
    new Index('Dummy Index', 'all', [], ''),
    '',
    '',
    1
);

test('Fails if the total allocation of assets is not 100%', () => {
    expect(() => new Portfolio([
        {
            allocation: 50, fund: dummyFund
        },
        {
            allocation: 49, fund: dummyFund
        }
    ])).toThrow(Error);
});

test('Allocates an investment sum to the funds', () => {
    const portfolio = new Portfolio([
        {
            allocation: 88,
            fund: dummyFund
        },
        {
            allocation: 12,
            fund: dummyFund
        }
    ]);

    expect(portfolio.allocate(new Money(200, 'EUR'))).toEqual([new Money(176, 'EUR'), new Money(24, 'EUR')]);
});
