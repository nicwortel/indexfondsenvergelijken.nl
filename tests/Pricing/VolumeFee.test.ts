import {Money} from "bigint-money";
import {FlatFee} from "../../src/Pricing/FlatFee";
import {Volume, VolumeFee} from "../../src/Pricing/VolumeFee";

test('Calculates the fee using the fee of the first volume', () => {
    const fee = new VolumeFee([
        new Volume(new Money(100000, 'EUR'), new FlatFee(new Money(5, 'EUR'))),
        new Volume(null, new FlatFee(new Money(0, 'EUR'))),
    ]);

    expect(fee.calculateFor(new Money(99000, 'EUR'))).toStrictEqual(new Money(5, 'EUR'));
});

test('Calculates the fee using the fee of the last volume', () => {
    const fee = new VolumeFee([
        new Volume(new Money(100000, 'EUR'), new FlatFee(new Money(5, 'EUR'))),
        new Volume(null, new FlatFee(new Money(0, 'EUR'))),
    ]);

    expect(fee.calculateFor(new Money(100001, 'EUR'))).toStrictEqual(new Money(0, 'EUR'));
});
