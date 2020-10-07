import {Money} from "bigint-money/dist";
import {Tier} from "./Tier";

export class TieredFee {
    constructor(public tiers: Tier[]) {
    }

    public calculateFee(input: Money): Money {
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

            let tierFee = tierAmount * tier.percentage.getFraction();

            totalAmount = totalAmount.add(tierFee.toFixed(2));
            previousTierLimit = tier.upperLimit;
        }

        return totalAmount;
    }
}
