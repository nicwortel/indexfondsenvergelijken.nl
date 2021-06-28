import {Money} from "bigint-money/dist";
import {Broker} from "./Broker";
import {Percentage} from "./Percentage";
import {Portfolio} from "./Portfolio";
import {Transaction} from "./Transaction";

export class Simulation {
    public totalInvestment: Money = new Money(0, 'EUR');
    public totalTransactionFees: Money = new Money(0, 'EUR');
    public totalServiceFees: Money = new Money(0, 'EUR');
    public totalDividendDistributionFees = new Money(0, 'EUR');

    private monthsPassed = 0;

    constructor(
        private broker: Broker,
        private portfolio: Portfolio,
        private initialInvestment: Money,
        private monthlyInvestment: Money,
        private expectedYearlyReturn: Percentage,
        private expectedDividendYield: Percentage
    ) {
    }

    public run(years: number): void {
        for (let i = 0; i < years; i++) {
            this.runYear();
        }
    }

    public getPortfolioValue(): Money {
        return this.portfolio.getValue();
    }

    public getTotalCosts(): Money {
        return this.portfolio.getTotalCosts()
            .add(this.totalTransactionFees)
            .add(this.totalServiceFees)
            .add(this.totalDividendDistributionFees);
    }

    public getNetProfit(): Money {
        return this.portfolio.getValue().subtract(this.totalInvestment);
    }

    public getNetResult(): number {
        return parseFloat(this.getNetProfit().toFixed(4)) / parseFloat(this.totalInvestment.toFixed(4));
    }

    private runYear(): void {
        for (let i = 0; i < 4; i++) {
            this.runQuarter();
        }
    }

    private runQuarter(): void {
        const startValue = this.portfolio.getValue();

        let combinedEndOfMonthValue = new Money(0, 'EUR');
        for (let i = 0; i < 3; i++) {
            this.runMonth();
            combinedEndOfMonthValue = combinedEndOfMonthValue.add(this.portfolio.getValue());
        }

        this.collectAndReinvestDividends();

        const serviceFee = this.broker.getQuarterlyServiceFee(
            this.portfolio.getValue(),
            combinedEndOfMonthValue.divide(3),
            startValue.add(this.portfolio.getValue()).divide(2)
        );

        this.registerServiceFee(serviceFee);
    }

    private runMonth(): void {
        const investment = this.isFirstMonth() ? this.initialInvestment : this.monthlyInvestment;

        let transactionCosts = new Money(0, 'EUR');

        if (investment.isGreaterThan(0)) {
            this.totalInvestment = this.totalInvestment.add(investment);

            transactionCosts = this.getTransactionCosts(investment);

            this.portfolio.invest(investment.subtract(transactionCosts));
            this.totalTransactionFees = this.totalTransactionFees.add(transactionCosts);
        }

        this.broker.registerTransactionCosts(transactionCosts);

        const netReturn = this.expectedYearlyReturn.subtract(this.portfolio.getTotalExpenseRatio());
        const monthlyNetReturn = this.getMonthlyRate(netReturn);
        const monthlyCosts = this.getMonthlyRate(this.portfolio.getTotalExpenseRatio());

        this.portfolio.grow(monthlyNetReturn, monthlyCosts);

        this.registerServiceFee(this.broker.getMonthlyServiceFee(this.portfolio.getValue()));

        this.monthsPassed++;
    }

    private getTransactionCosts(amount: Money): Money {
        const transactions = this.portfolio.allocate(amount);
        const transactionCosts = transactions.map((transaction: Transaction) => this.broker.getTransactionCosts(transaction));

        return transactionCosts.reduce((total: Money, current: Money): Money => total.add(current), new Money(0, 'EUR'));
    }

    private collectAndReinvestDividends(): void {
        const quarterlyDividendYield = this.expectedDividendYield.multiply(new Percentage(25));

        const dividend = this.portfolio.collectDividends(quarterlyDividendYield);
        const dividendFees = this.broker.calculateDividendFees(dividend);

        this.totalDividendDistributionFees = this.totalDividendDistributionFees.add(dividendFees);

        const investableDividend = dividend.subtract(dividendFees);

        this.portfolio.invest(investableDividend);
    }

    private registerServiceFee(serviceFee: Money): void {
        this.portfolio.sell(serviceFee);
        this.totalServiceFees = this.totalServiceFees.add(serviceFee);
    }

    private getMonthlyRate(yearly: Percentage): Percentage {
        return Percentage.createFromFraction((1 + yearly.getFraction()) ** (1/12) - 1);
    }

    private isFirstMonth(): boolean {
        return this.monthsPassed === 0;
    }
}
