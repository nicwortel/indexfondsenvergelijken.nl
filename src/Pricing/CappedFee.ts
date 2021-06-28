import {Money} from "bigint-money/dist";
import {NumberFormatter} from "../NumberFormatter";
import {Fee} from "./Fee";

export class CappedFee implements Fee {
    constructor(private minimum: Money, private maximum: Money, private fee: Fee) {
    }

    public calculateFor(amount: Money): Money {
        const fee = this.fee.calculateFor(amount);

        if (this.minimum.isGreaterThan(fee)) {
            return this.minimum;
        }

        if (this.maximum.isLesserThan(fee)) {
            return this.maximum;
        }

        return fee;
    }

    public describe(): string {
        const numberFormatter = new NumberFormatter();

        if (this.minimum.isEqual(0)) {
            return this.fee.describe() + ' (max. ' + numberFormatter.formatMoney(this.maximum) + ')';
        }

        return this.fee.describe() + ' (min. ' + numberFormatter.formatMoney(this.minimum) + ', max. ' + numberFormatter.formatMoney(this.maximum) + ')';
    }

    public getExtendedDescription(): string[] {
        const numberFormatter = new NumberFormatter();

        if (this.minimum.isEqual(0)) {
            return this.fee.getExtendedDescription().concat([
                'Maximum: ' + numberFormatter.formatMoney(this.maximum),
            ])
        }

        return this.fee.getExtendedDescription().concat([
            'Minimum: ' + numberFormatter.formatMoney(this.minimum),
            'Maximum: ' + numberFormatter.formatMoney(this.maximum),
        ])
    }
}
