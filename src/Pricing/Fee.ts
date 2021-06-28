import {Money} from "bigint-money/dist";

export interface Fee {
    calculateFor(amount: Money): Money;

    describe(): string;

    getExtendedDescription(): string[];
}
