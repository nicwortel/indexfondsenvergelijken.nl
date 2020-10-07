import {Money} from "bigint-money";
import {Fund} from "../src/Fund";
import {Index} from "../src/Index/Index";
import {Percentage} from "../src/Percentage";
import {Portfolio} from "../src/Portfolio";

const dummyFund = new Fund(
    'Dummy Fund',
    'DUM',
    'NL123',
    'foo',
    new Percentage(0.1),
    new Percentage(0),
    new Percentage(0),
    new Index('Dummy Index', 'all', [], ''),
    '',
    '',
    1
);

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

    expect(portfolio.allocate(new Money(200, 'EUR'))).toEqual([new Money(176, 'EUR'), new Money(24, 'EUR')]);
});
