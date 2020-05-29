import {WealthTax} from "./WealthTax";
import {Broker} from "./Broker";
import {Money} from "bigint-money/dist";
import {Portfolio} from "./Portfolio";

export class Simulation {
    public value: Money = new Money(0, 'EUR');
    public totalInvestment: Money = new Money(0, 'EUR');
    public totalFundCosts: Money = new Money(0, 'EUR');
    public totalTransactionFees: Money = new Money(0, 'EUR');
    public totalServiceFees: Money = new Money(0, 'EUR');
    public totalWealthTax: Money = new Money(0, 'EUR');

    constructor(
        private wealthTax: WealthTax,
        private broker: Broker,
        private portfolio: Portfolio,
        private initialInvestment: Money,
        private monthlyInvestment: Money,
        private expectedYearlyReturn: number
    ) {
        this.invest(this.initialInvestment);
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
        return this.value
            .subtract(this.totalInvestment)
            .subtract(this.totalServiceFees)
            .subtract(this.totalWealthTax);
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

        for (let i = 0; i < 3; i++) {
            this.runMonth();
        }

        const investedCapitalAtEnd = this.value;
        const averageInvestedCapital = investedCapitalAtStart.add(investedCapitalAtEnd).divide(2);

        this.addQuarterlyBrokerServiceFees(averageInvestedCapital);
    }

    private runMonth(): void {
        const growthRatio = 1 + this.getMonthlyRate(this.expectedYearlyReturn - this.portfolio.getTotalCosts());

        this.value = this.value.multiply(growthRatio.toString());
        this.totalFundCosts = this.totalFundCosts.add(this.value.multiply(this.getMonthlyRate(this.portfolio.getTotalCosts()).toString()))

        this.invest(this.monthlyInvestment);
    }

    private invest(amount: Money): void {
        this.totalInvestment = this.totalInvestment.add(amount);

        const transactionCosts = this.broker.getTransactionCosts(amount);
        this.value = this.value.add(amount.subtract(transactionCosts));
        this.totalTransactionFees = this.totalTransactionFees.add(transactionCosts);
    }

    private registerWealthTax(): void {
        this.totalWealthTax = this.totalWealthTax.add(this.wealthTax.getTaxAmount(this.value));
    }

    private addQuarterlyBrokerServiceFees(averageInvestedCapital: Money): void {
        this.totalServiceFees = this.totalServiceFees.add(this.broker.getQuarterlyCosts(averageInvestedCapital));
    }

    private getMonthlyRate(yearlyRate: number): number {
        return (1 + yearlyRate) ** (1 / 12) - 1;
    }
}
