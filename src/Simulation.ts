import {Money} from "bigint-money/dist";
import {Broker} from "./Broker";
import {Percentage} from "./Percentage";
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
        private expectedYearlyReturn: Percentage,
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

        const netReturn = this.expectedYearlyReturn.subtract(this.portfolio.getTotalCosts());
        const growthPercentage = this.getMonthlyRate(netReturn).add(new Percentage(100));

        this.value = growthPercentage.applyTo(this.value);
        this.totalFundCosts = this.totalFundCosts.add(this.getMonthlyRate(this.portfolio.getTotalCosts()).applyTo(this.value));

        this.monthsPassed++;
    }

    private invest(amount: Money): void {
        this.totalInvestment = this.totalInvestment.add(amount);

        const transactions = this.portfolio.allocate(amount);
        const transactionCosts = transactions.reduce((total: Money, transaction: Money): Money => total.add(this.broker.getTransactionCosts(transaction)), new Money(0, 'EUR'));

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

    private getMonthlyRate(yearly: Percentage): Percentage {
        return Percentage.createFromFraction((1 + yearly.getFraction()) ** (1/12) - 1);
    }
}
