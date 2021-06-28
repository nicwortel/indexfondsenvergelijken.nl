import {Money} from "bigint-money/dist";
import {Fee} from "./Fee";

export class NullFee implements Fee {
    public calculateFor(amount: Money): Money {
        return new Money(0, amount.currency);
    }

    public describe(): string {
        return '';
    }

    getExtendedDescription(): string[] {
        return [];
    }
}
