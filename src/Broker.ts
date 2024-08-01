import {Money} from "bigint-money/dist";
import {Etf} from "./Fund/Etf";
import {Fund} from "./Fund/Fund";
import {MutualFund} from "./Fund/MutualFund";
import {DeductibleFee} from "./Pricing/DeductibleFee";
import {Fee} from "./Pricing/Fee";
import {Transaction} from "./Transaction";
import {FundSelection} from "./FundSelection";

export class Broker {
    constructor(
        public name: string,
        public product: string,
        public serviceFee: Fee,
        public serviceFeeFrequency: 'monthly' | 'quarterly' = 'quarterly',
        public serviceFeeCalculation: 'averageEndOfMonth' | 'averageOfQuarter' | 'endOfQuarter',
        public mutualFundTransactionFee: Fee,
        public etfTransactionFee: Fee,
        public selectionMutualFundTransactionFee: Fee,
        public selectionEtfTransactionFee: Fee,
        public fundSelections: FundSelection[],
        public dividendDistributionFee: Fee,
        public costOverview: string,
        public logo?: string,
        public website?: string,
        public affiliateLink?: string
    )
    {
    }

    public getTransactionCosts(transaction: Transaction): Money {
        const transactionFee = this.getTransactionFeeFor(transaction.fund);

        return transactionFee.calculateFor(transaction.amount);
    }

    public calculateDividendFees(dividend: Money): Money {
        return this.dividendDistributionFee.calculateFor(dividend);
    }

    public registerTransactionCosts(transactionCosts: Money): void {
        if (this.serviceFee instanceof DeductibleFee) {
            this.serviceFee.updateLastTransactionCosts(transactionCosts);
        }
    }

    public getMonthlyServiceFee(portfolioValue: Money): Money {
        if (this.serviceFeeFrequency !== 'monthly') {
            return new Money(0, 'EUR');
        }

        return this.serviceFee.calculateFor(portfolioValue);
    }

    public getQuarterlyServiceFee(portfolioValue: Money, averageMonthlyValue: Money, averageValue: Money): Money {
        if (this.serviceFeeFrequency !== 'quarterly') {
            return new Money(0, 'EUR');
        }

        if (this.serviceFeeCalculation === 'averageEndOfMonth') {
            return this.serviceFee.calculateFor(averageMonthlyValue);
        } else if (this.serviceFeeCalculation === 'averageOfQuarter') {
            return this.serviceFee.calculateFor(averageValue);
        }

        return this.serviceFee.calculateFor(portfolioValue);
    }

    private getTransactionFeeFor(fund: Fund): Fee {
        if (this.fundSelections.some((selection) => selection.contains(fund))) {
            if (fund instanceof MutualFund) {
                return this.selectionMutualFundTransactionFee;
            }

            if (fund instanceof Etf) {
                return this.selectionEtfTransactionFee;
            }
        }

        if (fund instanceof MutualFund) {
            return this.mutualFundTransactionFee;
        }

        if (fund instanceof Etf) {
            return this.etfTransactionFee;
        }
    }
}
