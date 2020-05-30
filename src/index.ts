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

    return parseFloat(field.value);
}

const combinationData = [
    {broker: 'ING', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'ABN Amro', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'Rabobank', portfolio: [{allocation: 88, fund: 'NT World'}, {allocation: 12, fund: 'NT EM'}], automatedInvesting: true},
    {broker: 'Meesman', portfolio: [{allocation: 100, fund: 'Meesman Wereldwijd Totaal'}], automatedInvesting: true},
    {broker: 'DEGIRO', portfolio: [{allocation: 100, fund: 'VWRL'}], automatedInvesting: false},
    {broker: 'Binck', portfolio: [{allocation: 100, fund: 'VWRL'}], automatedInvesting: true},
    {broker: 'FitVermogen', portfolio: [{allocation: 88, fund: 'NN Enhanced'}, {allocation: 12, fund: 'NN Enhanced EM'}], automatedInvesting: true},
    {broker: 'Binck', portfolio: [{allocation: 88, fund: 'AVIAW'}, {allocation: 12, fund: 'AVIAO'}], automatedInvesting: true}
]

const combinations = combinationData.map(function (combination) {
    const broker = brokerRepository.getBroker(combination.broker);
    const funds = combination.portfolio.map(function (portfolio) {
        return {allocation: portfolio.allocation, fund: fundRepository.getFund(portfolio.fund)};
    })

    const portfolio = new Portfolio(funds);

    return {broker, portfolio, automatedInvesting: combination.automatedInvesting};
});

function createExternalLink(url: string, label: string): string {
    const element = document.createElement('a');
    element.innerHTML = label;
    element.setAttribute('href', url);
    element.setAttribute('target', '_blank');

    return element.outerHTML;
}

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

    let results = combinations.map(function (combination) {
        const simulation = new Simulation(
            new WealthTax(),
            combination.broker,
            combination.portfolio,
            initialInvestment,
            monthlyInvestment,
            expectedYearlyReturn
        );

        simulation.run(years);

        return {combination, simulation};
    });

    results = results.sort((a, b) => b.simulation.getNetResult() - a.simulation.getNetResult());

    results.forEach(function (result): void {
        const combination = result.combination;
        const simulation = result.simulation;

        const row = tableBody.insertRow();

        let brokerInfo = [];

        if (combination.broker.baseFee.isGreaterThan(0)) {
            brokerInfo.push('Basisfee: ' + numberFormatter.formatMoney(combination.broker.baseFee) + ' p.j.');
        }

        if (combination.broker.minimumServiceFee) {
            brokerInfo.push('Minimum servicekosten: ' + numberFormatter.formatMoney(combination.broker.minimumServiceFee) + ' per kwartaal');
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

        if (combination.broker.maximumServiceFee) {
            brokerInfo.push('Maximum servicekosten: ' + numberFormatter.formatMoney(combination.broker.maximumServiceFee) + ' per kwartaal');
        }

        brokerInfo.push('Transactiekosten: ' + numberFormatter.formatPercentage(combination.broker.transactionFee));

        let brokerInfoTooltip = '<span class="info" title="' + brokerInfo.join('\n') + '">';
        if (combination.broker.costOverview) {
            brokerInfoTooltip = createExternalLink(combination.broker.costOverview, brokerInfoTooltip);
        }

        row.insertCell().innerHTML = [combination.broker.name, combination.broker.product].join(' ').trim() + ' ' + brokerInfoTooltip + '</span>';

        let portfolioInfo = [];
        for (let fund of combination.portfolio.assets.map((asset) => asset.fund)) {
            if (fund.entryFee > 0) {
                portfolioInfo.push('Instapkosten ' + fund.symbol + ': ' + numberFormatter.formatPercentage(fund.entryFee));
            }

            portfolioInfo.push('Lopende kosten ' + fund.symbol + ': ' + numberFormatter.formatPercentage(fund.totalExpenseRatio));

            if (fund.dividendLeakage > 0) {
                portfolioInfo.push('Dividendlek ' + fund.symbol + ': ' + numberFormatter.formatPercentage(fund.dividendLeakage));
            }
        }
        portfolioInfo.push('Portfoliokosten: ' + numberFormatter.formatPercentage(combination.portfolio.getTotalCosts(), 3));
        row.insertCell().innerHTML = combination.portfolio.describe() + ' <span class="info" title="' + portfolioInfo.join('\n') + '"></span>';

        row.insertCell().innerText = combination.automatedInvesting ? 'ja' : 'nee';

        insertMoneyTableCell(row, simulation.value);
        insertMoneyTableCell(row, simulation.totalServiceFees);
        insertMoneyTableCell(row, simulation.getTotalCosts());
        insertMoneyTableCell(row, simulation.totalWealthTax);
        insertMoneyTableCell(row, simulation.getNetProfit());

        const netResultCell = row.insertCell();
        netResultCell.innerText = numberFormatter.formatPercentage(simulation.getNetResult());
        netResultCell.classList.add('text-right');
    });
}

function insertMoneyTableCell(row: HTMLTableRowElement, amount: Money): void {
    const cell = row.insertCell();
    cell.innerText = numberFormatter.formatMoney(amount);
    cell.classList.add('text-right');
}

form.onchange = () => runSimulation();
window.onload = () => runSimulation();
