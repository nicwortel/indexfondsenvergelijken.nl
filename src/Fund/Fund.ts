import {Index} from "../Index/Index";
import {Percentage} from "../Percentage";
import {Money} from "bigint-money/dist";

export interface Fund {
    getName(): string;

    getIdentifier(): string;

    getIsin(): string;

    getLogo(): string;

    getTotalExpenseRatio(totalInvested?: Money): Percentage;

    getInternalTransactionCosts(): Percentage;

    getDividendLeak(): Percentage;

    getTrackedIndex(): Index;

    getKiid(): string;

    getFactsheet(): string;

    getEsgExclusions(): Percentage;

    getMarketCapitalization(): Percentage;

    containsSmallCaps(): boolean;
}
