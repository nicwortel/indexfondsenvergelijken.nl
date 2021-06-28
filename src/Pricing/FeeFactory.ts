import {Money} from "bigint-money/dist";
import {BaseFee} from "./BaseFee";
import {CappedFee} from "./CappedFee";
import {Fee} from "./Fee";
import {NullFee} from "./NullFee";
import {PercentageFee} from "./PercentageFee";
import {Tier, TieredFee} from "./TieredFee";

export class FeeFactory {
    private readonly currency: string = 'EUR';

    public create(data: any): Fee {
        if (data === undefined || data == 0) {
            return new NullFee();
        }

        if (typeof data == 'number') {
            return new PercentageFee(data);
        }

        let fee: Fee;

        if (data.tiers) {
            const tiers = data.tiers.map((tier: { upperLimit: number, percentage: number }) => {
                const upperLimit = tier.upperLimit ? new Money(tier.upperLimit, this.currency) : null;

                return new Tier(upperLimit, new PercentageFee(tier.percentage));
            });

            fee = new TieredFee(tiers);
        } else {
            fee = new PercentageFee(data.percentage);
        }

        if (data.base) {
            fee = new BaseFee(new Money(data.base.toString(), this.currency), fee);
        }

        if (data.minimum || data.maximum) {
            const minimum = data.minimum ?? 0;

            fee = new CappedFee(new Money(minimum.toString(), 'EUR'), new Money(data.maximum.toString(), 'EUR'), fee);
        }

        return fee;
    }
}
