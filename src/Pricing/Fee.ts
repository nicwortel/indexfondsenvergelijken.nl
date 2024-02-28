import {Money} from "bigint-money";

export interface Fee {
    calculateFor(amount: Money): Money;

    describe(): string;

    getExtendedDescription(): string[];
}
