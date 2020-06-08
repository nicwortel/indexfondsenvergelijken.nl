import {Money} from "bigint-money/dist";
import {Broker} from "./Broker";
import {Portfolio} from "./Portfolio";
import {WealthTax} from "./WealthTax";

export class Simulation {
    public value: Money = new Money(0, 'EUR');
    public totalInvestment: Money = new Money(0, 'EUR');
    public totalFundCosts: Money = new Money(0, 'EUR');
    public totalTransactionFees: Money = new Money(0, 'EUR');
    public totalServiceFees: Money = new Money(0, 'EUR');
    public totalWealthTax: Money = new Money(0, 'EUR');

    private monthsPassed = 0;

    constructor(
        private wealthTax: WealthTax,
        private broker: Broker,
        private portfolio: Portfolio,
        private initialInvestment: Money,
        private monthlyInvestment: Money,
        private expectedYearlyReturn: number,
        private subtractServiceFeesFromInvestments: boolean
    ) {
    }

    public run(years: number): void {
        for (let i = 0; i < years; i++) {
            this.runYear();
        }
    }

    public getTotalCosts(): Money {
        return this.totalFundCosts.add(this.totalTransactionFees).add(this.totalServiceFees);
    }

    public getNetProfit(): Money {
        if (this.subtractServiceFeesFromInvestments) {
            return this.value.subtract(this.totalInvestment);
        }

        return this.value
            .subtract(this.totalInvestment)
            .subtract(this.totalServiceFees);
    }

    public getNetResult(): number {
        return parseFloat(this.getNetProfit().toFixed(4)) / parseFloat(this.totalInvestment.toFixed(4));
    }

    private runYear(): void {
        this.registerWealthTax();

        for (let i = 0; i < 4; i++) {
            this.runQuarter();
        }
    }

    private runQuarter(): void {
        const investedCapitalAtStart = this.value;

        let combinedEndOfMonthValue = new Money(0, 'EUR');
        for (let i = 0; i < 3; i++) {
            this.runMonth();
            combinedEndOfMonthValue = combinedEndOfMonthValue.add(this.value);
        }

        if (this.broker.serviceFeeCalculation === 'averageEndOfMonth') {
            this.addQuarterlyBrokerServiceFees(combinedEndOfMonthValue.divide(3));
        } else if (this.broker.serviceFeeCalculation === 'averageOfQuarter') {
            const averageInvestedCapital = investedCapitalAtStart.add(this.value).divide(2);
            this.addQuarterlyBrokerServiceFees(averageInvestedCapital);
        } else if (this.broker.serviceFeeCalculation === 'endOfQuarter') {
            this.addQuarterlyBrokerServiceFees(this.value);
        }
    }

    private runMonth(): void {
        this.invest(this.monthsPassed === 0 ? this.initialInvestment : this.monthlyInvestment);

        const growthRatio = 1 + this.getMonthlyRate(this.expectedYearlyReturn - this.portfolio.getTotalCosts());

        this.value = this.value.multiply(growthRatio.toString());
        this.totalFundCosts = this.totalFundCosts.add(this.value.multiply(this.getMonthlyRate(this.portfolio.getTotalCosts()).toString()))

        this.monthsPassed++;
    }

    private invest(amount: Money): void {
        this.totalInvestment = this.totalInvestment.add(amount);

        const transactionCosts = this.broker.getTransactionCosts(amount);
        const investment = amount.subtract(transactionCosts);

        const entryFee = this.portfolio.getEntryCosts(investment);

        this.value = this.value.add(investment.subtract(entryFee));
        this.totalTransactionFees = this.totalTransactionFees.add(transactionCosts);
        this.totalFundCosts = this.totalFundCosts.add(entryFee);
    }

    private registerWealthTax(): void {
        this.totalWealthTax = this.totalWealthTax.add(this.wealthTax.getTaxAmount(this.value));
    }

    private addQuarterlyBrokerServiceFees(averageInvestedCapital: Money): void {
        const serviceFee = this.broker.getQuarterlyCosts(averageInvestedCapital);

        if (this.subtractServiceFeesFromInvestments) {
            this.value = this.value.subtract(serviceFee);
        }

        this.totalServiceFees = this.totalServiceFees.add(serviceFee);
    }

    private getMonthlyRate(yearlyRate: number): number {
        return (1 + yearlyRate) ** (1 / 12) - 1;
    }
}
