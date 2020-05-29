import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";

export class Broker {
    constructor(
        public name: string,
        public product: string,
        public baseFee: Money,
        public serviceFee: TieredFee,
        public transactionFee: number,
        public costOverview: string
    ) {
    }

    public getTransactionCosts(investment: Money): Money {
        return investment.multiply(this.transactionFee.toString());
    }

    public getYearlyCosts(equity: Money): Money {
        return this.baseFee.add(this.serviceFee.calculateFee(equity));
    }
}
