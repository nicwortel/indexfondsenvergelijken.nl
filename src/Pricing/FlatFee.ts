import {Money} from "bigint-money/dist";
import {NumberFormatter} from "../NumberFormatter";
import {Fee} from "./Fee";

export class FlatFee implements Fee {
    constructor(private fee: Money) {
    }

    public calculateFor(): Money {
        return this.fee;
    }

    public describe(): string {
        const numberFormatter = new NumberFormatter();

        return numberFormatter.formatMoney(this.fee);
    }

    public getExtendedDescription(): string[] {
        return [this.describe()];
    }
}
