import {Money} from "bigint-money";

export class NumberFormatter {
    readonly locale = 'nl-NL';

    public formatMoney(amount: Money, maximumDigits: number = 2): string {
        return this.formatMoneyFromNumber(parseFloat(amount.toFixed(2)), amount.currency, maximumDigits);
    }

    public formatMoneyFromNumber(amount: number, currency: string, maximumDigits = 2): string {
        const formatter = new Intl.NumberFormat(this.locale, {
            style: 'currency',
            minimumFractionDigits: maximumDigits,
            maximumFractionDigits: maximumDigits,
            currency: currency
        });

        return formatter.format(amount);
    }

    public formatPercentage(fraction: number, maximumDigits: number = 2): string {
        const formatter = new Intl.NumberFormat(this.locale, {
            style: 'percent',
            maximumFractionDigits: maximumDigits
        });

        return formatter.format(fraction);
    }
}
