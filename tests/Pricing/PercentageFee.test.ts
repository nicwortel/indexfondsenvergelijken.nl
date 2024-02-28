import {Money} from "bigint-money";
import {PercentageFee} from "../../src/Pricing/PercentageFee";

test('Calculates the fee for an amount of money', () => {
    const fee = new PercentageFee(1);

    expect(fee.calculateFor(new Money(102, 'EUR'))).toStrictEqual(new Money('1.02', 'EUR'));
});

test('Returns the human-readable form', () => {
    const fee = new PercentageFee(2.1);

    expect(fee.describe()).toBe('2,1%');
})
