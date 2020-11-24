import {Etf} from "./Fund/Etf";
import {Fund} from "./Fund/Fund";
import {MutualFund} from "./Fund/MutualFund";
import {Fee} from "./Pricing/Fee";
import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";
import {Transaction} from "./Transaction";

export class Broker {
    constructor(
        public name: string,
        public product: string,
        public baseFee: Money,
        public serviceFee: TieredFee,
        public serviceFeeCalculation: string,
        public mutualFundTransactionFee: Fee,
        public etfTransactionFee: Fee,
        public costOverview: string,
        public minimumServiceFee?: Money,
        public maximumServiceFee?: Money,
        public logo?: string,
        public website?: string,
        public affiliateLink?: string
    ) {
    }

    public getTransactionCosts(transaction: Transaction): Money {
        const transactionFee = this.getTransactionFeeFor(transaction.fund);

        return transactionFee.calculateFor(transaction.amount);
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

    private getTransactionFeeFor(fund: Fund): Fee {
        if (fund instanceof MutualFund) {
            return this.mutualFundTransactionFee;
        }

        if (fund instanceof Etf) {
            return this.etfTransactionFee;
        }
    }
}
