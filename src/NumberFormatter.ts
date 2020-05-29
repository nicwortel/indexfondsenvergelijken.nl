import {Money} from "bigint-money/dist";

export class NumberFormatter {
    constructor(private locale: string) {
    }

    public format(number: number): string {
        const formatter = new Intl.NumberFormat('nl-NL');

        return formatter.format(number);
    }

    public formatMoney(amount: Money): string {
        return this.formatMoneyFromNumber(parseFloat(amount.toFixed(2)), amount.currency);

        const formatter = new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: amount.currency
        });

        return formatter.format(parseFloat(amount.toFixed(2)))
    }

    public formatMoneyFromNumber(amount: number, currency: string, maximumDigits = 2): string {
        const formatter = new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            minimumFractionDigits: maximumDigits,
            maximumFractionDigits: maximumDigits,
            currency: currency
        });

        return formatter.format(amount);
    }

    public formatPercentage(fraction: number, maximumDigits: number = 2): string {
        const formatter = new Intl.NumberFormat('nl-NL', {
            style: 'percent',
            maximumFractionDigits: maximumDigits
        });

        return formatter.format(fraction);
    }
}
