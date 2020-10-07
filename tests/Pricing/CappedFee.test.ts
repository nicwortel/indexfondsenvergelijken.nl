import {Money} from "bigint-money";
import {CappedFee} from "../../src/Pricing/CappedFee";
import {PercentageFee} from "../../src/Pricing/PercentageFee";

test('Caps the fee at a minimum price', () => {
    const fee = new CappedFee(new Money(2, 'EUR'), new Money(10, 'EUR'), new PercentageFee(10));

    expect(fee.calculateFor(new Money(1, 'EUR'))).toStrictEqual(new Money(2, 'EUR'));
});

test('Caps the fee at a maximum price', () => {
    const fee = new CappedFee(new Money(2, 'EUR'), new Money(10, 'EUR'), new PercentageFee(10));

    expect(fee.calculateFor(new Money(200, 'EUR'))).toStrictEqual(new Money(10, 'EUR'));
});

test('Returns an amount between the minimum and maximum', () => {
    const fee = new CappedFee(new Money(2, 'EUR'), new Money(10, 'EUR'), new PercentageFee(10));

    expect(fee.calculateFor(new Money(50, 'EUR'))).toStrictEqual(new Money(5, 'EUR'));
});

test('Returns the human-readable description', () => {
    const fee = new CappedFee(new Money(2, 'EUR'), new Money(10, 'EUR'), new PercentageFee(10));

    expect(fee.describe()).toEqual('10% (min. € 2,00, max. € 10,00)');
});
