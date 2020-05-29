import {Money} from "bigint-money/dist";

export class TieredFee {
    constructor(public tiers: { upperLimit: number, fee: number }[]) {
    }

    public calculateFee(input: Money) {
        const inputNumber = parseFloat(input.toFixed(2));

        let totalAmount = new Money(0, 'EUR');
        let previousTierLimit = 0;

        for (let tier of this.tiers) {
            let tierAmount;

            if (tier.upperLimit !== null) {
                tierAmount = Math.min(inputNumber, tier.upperLimit);
            } else {
                tierAmount = inputNumber;
            }
            tierAmount -= previousTierLimit;

            if (inputNumber <= previousTierLimit) {
                break;
            }

            let tierFee = tierAmount * tier.fee;

            totalAmount = totalAmount.add(tierFee.toFixed(2));
            previousTierLimit = tier.upperLimit;
        }

        return totalAmount;
    }
}
