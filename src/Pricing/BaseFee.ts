import {Money} from "bigint-money";
import {NumberFormatter} from "../NumberFormatter";
import {Fee} from "./Fee";

export class BaseFee implements Fee {
    constructor(private baseFee: Money, private additionalFee: Fee) {
    }

    public calculateFor(amount: Money): Money {
        return this.baseFee.add(this.additionalFee.calculateFor(amount));
    }

    public describe(): string {
        const numberFormatter = new NumberFormatter();

        return numberFormatter.formatMoney(this.baseFee) + ' + ' + this.additionalFee.describe();
    }

    public getExtendedDescription(): string[] {
        const numberFormatter = new NumberFormatter();

        return ['Basisfee: ' + numberFormatter.formatMoney(this.baseFee)].concat(this.additionalFee.getExtendedDescription());
    }
}
