import {Money} from "bigint-money/dist";
import {CappedFee} from "./CappedFee";
import {Fee} from "./Fee";
import {PercentageFee} from "./PercentageFee";

export class FeeFactory {
    public create(data: any): Fee {
        if (data === undefined) {
            return new PercentageFee(0);
        }

        if (data.minimum && data.maximum) {
            const fee = new PercentageFee(data.percentage);

            return new CappedFee(new Money(data.minimum.toString(), 'EUR'), new Money(data.maximum.toString(), 'EUR'), fee);
        }

        return new PercentageFee(data);
    }
}
