import {Money} from "bigint-money/dist";
import {BaseFee} from "./BaseFee";
import {CappedFee} from "./CappedFee";
import {Fee} from "./Fee";
import {PercentageFee} from "./PercentageFee";

export class FeeFactory {
    private readonly currency: string = 'EUR';

    public create(data: any): Fee {
        if (data === undefined) {
            return new PercentageFee(0);
        }

        if (typeof data == 'number') {
            return new PercentageFee(data);
        }

        let fee: Fee = new PercentageFee(data.percentage);

        if (data.base) {
            fee = new BaseFee(new Money(data.base, this.currency), fee);
        }

        if (data.minimum || data.maximum) {
            const minimum = data.minimum ?? 0;

            fee = new CappedFee(new Money(minimum.toString(), 'EUR'), new Money(data.maximum.toString(), 'EUR'), fee);
        }

        return fee;
    }
}
