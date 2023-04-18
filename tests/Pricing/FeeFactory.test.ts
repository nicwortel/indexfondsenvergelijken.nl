import {Money} from "bigint-money";
import {BaseFee} from "../../src/Pricing/BaseFee";
import {CappedFee} from "../../src/Pricing/CappedFee";
import {FeeFactory} from "../../src/Pricing/FeeFactory";
import {NullFee} from "../../src/Pricing/NullFee";
import {PercentageFee} from "../../src/Pricing/PercentageFee";
import {Volume, VolumeFee} from "../../src/Pricing/VolumeFee";
import {FlatFee} from "../../src/Pricing/FlatFee";

const factory = new FeeFactory();

test('Returns NullFee if not defined', () => {
    expect(factory.create(undefined)).toEqual(new NullFee());
});

test('Returns percentage fee if data is number', () => {
    expect(factory.create(5)).toEqual(new PercentageFee(5));
});

test('Returns fee with base fee if defined', () => {
    expect(factory.create({base: 5, percentage: 2})).toEqual(new BaseFee(new Money(5, 'EUR'), new PercentageFee(2)));
});

test('Returns capped fee if minimum and maximum are defined', () => {
    expect(factory.create({percentage: 2, minimum: 1, maximum: 10})).toEqual(new CappedFee(
        new Money(1, 'EUR'),
        new Money(10, 'EUR'),
        new PercentageFee(2)
    ));
});

test('Returns capped fee if maximum is defined', () => {
    expect(factory.create({percentage: 2, maximum: 10})).toEqual(new CappedFee(
        new Money(0, 'EUR'),
        new Money(10, 'EUR'),
        new PercentageFee(2)
    ));
});

test('Returns a volume fee if volumes are defined', () => {
    expect(factory.create({volumes: [{max: 10, flat: 5}]})).toEqual(new VolumeFee([
        new Volume(new Money(10, 'EUR'), new FlatFee(new Money(5, 'EUR')))
    ]));

    expect(factory.create({volumes: [{max: 10, percentage: 5}]})).toEqual(new VolumeFee([
        new Volume(new Money(10, 'EUR'), new PercentageFee(5))
    ]));
});
