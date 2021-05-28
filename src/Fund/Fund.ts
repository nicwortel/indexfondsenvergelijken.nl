import {Index} from "../Index/Index";
import {Percentage} from "../Percentage";

export interface Fund {
    getName(): string;

    getIdentifier(): string;

    getIsin(): string;

    getLogo(): string;

    getTotalExpenseRatio(): Percentage;

    getDividendLeak(): Percentage;

    getTotalRecurringCosts(): Percentage;

    getEntryFee(): Percentage;

    getTrackedIndex(): Index;

    getKiid(): string;

    getFactsheet(): string;

    getEsgExclusions(): Percentage;

    getMarketCapitalization(): Percentage;

    containsSmallCaps(): boolean;
}
