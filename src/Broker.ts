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

    public getQuarterlyCosts(averageInvestedCapital: Money): Money {
        const baseFee = this.baseFee.divide(4);
        const serviceFee = this.serviceFee.calculateFee(averageInvestedCapital).divide(4);

        return baseFee.add(serviceFee);
    }
}
