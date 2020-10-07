import {Money} from "bigint-money";
import {BaseFee} from "../../src/Pricing/BaseFee";
import {CappedFee} from "../../src/Pricing/CappedFee";
import {FeeFactory} from "../../src/Pricing/FeeFactory";
import {PercentageFee} from "../../src/Pricing/PercentageFee";

const factory = new FeeFactory();

test('Returns 0 if not defined', () => {
    expect(factory.create(undefined)).toEqual(new PercentageFee(0));
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
