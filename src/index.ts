import {BrokerRepository} from "./BrokerRepository";
import {FundRepository} from "./FundRepository";
import {Money} from "bigint-money/dist";
import {Simulation} from "./Simulation";
import {WealthTax} from "./WealthTax";
import {Portfolio} from "./Portfolio";
import {NumberFormatter} from "./NumberFormatter";

const brokerRepository = new BrokerRepository();
const fundRepository = new FundRepository();
const numberFormatter = new NumberFormatter('nl-NL');

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('form');

function getInputValue(elementId: string): number {
    const field: HTMLInputElement = <HTMLInputElement>document.getElementById(elementId);

    return parseInt(field.value);
}

const combinationData = [
    {broker: 'ING', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'ABN Amro', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'Rabobank', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'Meesman', portfolio: [{allocation: 100, fund: 'Meesman Wereldwijd Totaal'}], automatedInvesting: true},
    {broker: 'DEGIRO', portfolio: [{allocation: 100, fund: 'VWRL'}], automatedInvesting: false},
    {broker: 'Binck', portfolio: [{allocation: 100, fund: 'VWRL'}], automatedInvesting: true},
]

const combinations = combinationData.map(function (combination) {
    const broker = brokerRepository.getBroker(combination.broker);
    const funds = combination.portfolio.map(function (portfolio) {
        return {allocation: portfolio.allocation, fund: fundRepository.getFund(portfolio.fund)};
    })

    const portfolio = new Portfolio(funds);

    return {broker, portfolio, automatedInvesting: combination.automatedInvesting};
});

function runSimulation(): void {
    const initialInvestment = new Money(getInputValue('initial'), 'EUR');
    const monthlyInvestment = new Money(getInputValue('monthly'), 'EUR');
    const years = getInputValue('years');
    const expectedYearlyReturn = getInputValue('return') / 100;

    const totalInvestment = initialInvestment.add(monthlyInvestment.multiply(12 * years));
    document.getElementById('totalInvestment').innerText = numberFormatter.formatMoney(totalInvestment);
    for (let element of document.getElementsByClassName('years')) {
        element.innerHTML = years.toString();
    }

    const resultsTable: HTMLTableElement = <HTMLTableElement>document.getElementById('results');
    const tableBody = resultsTable.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    combinations.forEach(function (combination): void {
        const simulation = new Simulation(
            new WealthTax(),
            combination.broker,
            combination.portfolio,
            initialInvestment,
            monthlyInvestment,
            expectedYearlyReturn
        );

        simulation.run(years);

        const row = tableBody.insertRow();

        let brokerInfo = [];

        if (combination.broker.baseFee.isGreaterThan(0)) {
            brokerInfo.push('Basisfee: ' + numberFormatter.formatMoney(combination.broker.baseFee) + ' p.j.');
        }

        for (let tier of combination.broker.serviceFee.tiers) {
            let line = 'Servicekosten';
            if (tier.upperLimit) {
                line += ' t/m ' + numberFormatter.formatMoneyFromNumber(tier.upperLimit, 'EUR', 0);
            } else {
                line += ' daarboven';
            }
            line += ': ' + numberFormatter.formatPercentage(tier.fee);
            brokerInfo.push(line);
        }

        brokerInfo.push('Transactiekosten: ' + numberFormatter.formatPercentage(combination.broker.transactionFee));


        row.insertCell().innerHTML = [combination.broker.name, combination.broker.product].join(' ').trim() + ' <span class="info" title="' + brokerInfo.join('\n') + '"></span>';

        let portfolioInfo = [];
        for (let fund of combination.portfolio.assets.map((asset) => asset.fund)) {
            portfolioInfo.push('Lopende kosten ' + fund.symbol + ': ' + numberFormatter.formatPercentage(fund.totalExpenseRatio));

            if (fund.dividendLeakage > 0) {
                portfolioInfo.push('Dividendlek ' + fund.symbol + ': ' + numberFormatter.formatPercentage(fund.dividendLeakage));
            }
        }
        portfolioInfo.push('Portfoliokosten: ' + numberFormatter.formatPercentage(combination.portfolio.getTotalCosts(), 3));
        row.insertCell().innerHTML = combination.portfolio.describe() + ' <span class="info" title="' + portfolioInfo.join('\n') + '"></span>';

        row.insertCell().innerText = combination.automatedInvesting ? 'ja' : 'nee';
        row.insertCell().innerText = numberFormatter.formatMoney(simulation.value);
        row.insertCell().innerText = numberFormatter.formatMoney(simulation.totalServiceFees);
        row.insertCell().innerText = numberFormatter.formatMoney(simulation.getTotalCosts());
        row.insertCell().innerText = numberFormatter.formatMoney(simulation.totalWealthTax);
        row.insertCell().innerText = numberFormatter.formatMoney(simulation.getNetProfit());
        row.insertCell().innerText = numberFormatter.formatPercentage(simulation.getNetResult());
    });
}

form.onchange = () => runSimulation();
window.onload = () => runSimulation();
