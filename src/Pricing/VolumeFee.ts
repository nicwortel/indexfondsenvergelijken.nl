import {Money} from "bigint-money";
import {NumberFormatter} from "../NumberFormatter";
import {Fee} from "./Fee";

export class VolumeFee implements Fee {
    constructor(private volumes: Volume[]) {
    }

    public calculateFor(amount: Money): Money {
        for (let volume of this.volumes) {
            if (volume.max === null) {
                return volume.fee.calculateFor(amount);
            }

            if (amount.isLesserThan(volume.max)) {
                return volume.fee.calculateFor(amount);
            }
        }
    }

    public describe(): string {
        return this.getExtendedDescription().join(', ');
    }

    public getExtendedDescription(): string[] {
        const numberFormatter = new NumberFormatter();

        return this.volumes.map((volume: Volume): string => {
            if (volume.max === null) {
                return 'daarboven: ' + volume.fee.describe();
            }

            return 'tot ' + numberFormatter.formatMoney(volume.max, 0) + ': ' + volume.fee.describe();
        })
    }
}

export class Volume {
    constructor(public max: Money, public fee: Fee) {
    }
}
