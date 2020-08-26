import {Money} from "bigint-money/dist";
import {WealthTax} from "../src/WealthTax";

const wealthTax = new WealthTax();

test('Returns 0 when capital is below the tax free capital', () => {
    expect(wealthTax.getTaxAmount(new Money(30100, 'EUR'))).toStrictEqual(new Money(0, 'EUR'));
});

test.each([
    [150000, 972],
    [250000, 2228]
])('Calculates wealth tax', (capital: number, taxAmount: number) => {
    expect(wealthTax.getTaxAmount(new Money(capital, 'EUR'))).toStrictEqual(new Money(taxAmount, 'EUR'));
});
