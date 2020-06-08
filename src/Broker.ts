import {Fee} from "./Pricing/Fee";
import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";

export class Broker {
    constructor(
        public name: string,
        public product: string,
        public baseFee: Money,
        public serviceFee: TieredFee,
        public serviceFeeCalculation: string,
        public transactionFee: Fee,
        public costOverview: string,
        public minimumServiceFee?: Money,
        public maximumServiceFee?: Money
    ) {
    }

    public getTransactionCosts(investment: Money): Money {
        return this.transactionFee.calculateFor(investment);
    }

    public getQuarterlyCosts(averageInvestedCapital: Money): Money {
        const baseFee = this.baseFee.divide(4);

        let serviceFee = this.serviceFee.calculateFee(averageInvestedCapital).divide(4);

        if (this.minimumServiceFee && serviceFee.isLesserThan(this.minimumServiceFee)) {
            serviceFee = this.minimumServiceFee;
        }
        if (this.maximumServiceFee && serviceFee.isGreaterThan(this.maximumServiceFee)) {
            serviceFee = this.maximumServiceFee;
        }

        return baseFee.add(serviceFee);
    }
}
