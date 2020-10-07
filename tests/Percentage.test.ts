import {Money} from "bigint-money";
import {Percentage} from "../src/Percentage";

test('Can be created from a fraction', () => {
    expect(Percentage.createFromFraction(0.01)).toStrictEqual(new Percentage(1));
    expect(Percentage.createFromFraction(0.01).getFraction()).toBe(0.01);
});

test('Adds up to another percentage', () => {
    expect(new Percentage(10).add(new Percentage(20))).toStrictEqual(new Percentage(30));
});

test('Subtracts another percentage', () => {
    expect(new Percentage(50).subtract(new Percentage(15))).toStrictEqual(new Percentage(35));
});

test('Multiplies with another percentage', () => {
    expect(new Percentage(50).multiply(new Percentage(25))).toStrictEqual(new Percentage(12.5));
});

test('Applies to money', () => {
    expect(new Percentage(12).applyTo(new Money(100, 'EUR'))).toStrictEqual(new Money(12, 'EUR'));
});

test('Compares with other percentages', () => {
    expect(new Percentage(85).equals(new Percentage(84))).toBeFalsy();
});
