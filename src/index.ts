import {Broker} from "./Broker";
import {BrokerRepository} from "./BrokerRepository";
import {Fund} from "./Fund";
import {FundRepository} from "./FundRepository";
import {Money} from "bigint-money/dist";
import {Simulation} from "./Simulation";
import {WealthTax} from "./WealthTax";

const moneyFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
});

const percentageFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    maximumFractionDigits: 2
});

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('form');

function getInputValue(elementId: string): number {
    const field: HTMLInputElement = <HTMLInputElement>document.getElementById(elementId);

    return parseInt(field.value);
}

const combinations = [
    {broker: 'ING', fund: 'NT World', automatedInvesting: true},
    {broker: 'ABN Amro', fund: 'NT World', automatedInvesting: true},
    {broker: 'Rabobank', fund: 'NT World', automatedInvesting: true},
    {broker: 'Meesman', fund: 'Meesman Wereldwijd Totaal', automatedInvesting: true},
    {broker: 'DEGIRO', fund: 'VWRL', automatedInvesting: false},
    {broker: 'Binck', fund: 'VWRL', automatedInvesting: true}
];

const brokers = new BrokerRepository().getAll();
const funds = new FundRepository().getAll();

function formatMoney(money: Money): string {
    return moneyFormatter.format(parseFloat(money.toFixed(2)));
}

function runSimulation(): void {
    const initialInvestment = new Money(getInputValue('initial'), 'EUR');
    const monthlyInvestment = new Money(getInputValue('monthly'), 'EUR');
    const years = getInputValue('years');
    const expectedYearlyReturn = getInputValue('return') / 100;

    const totalInvestment = initialInvestment.add(monthlyInvestment.multiply(12 * years));
    document.getElementById('totalInvestment').innerText = formatMoney(totalInvestment);
    for (let element of document.getElementsByClassName('years')) {
        element.innerHTML = years.toString();
    }

    const resultsTable: HTMLTableElement = <HTMLTableElement>document.getElementById('results');
    const tableBody = resultsTable.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    combinations.forEach(function (combination): void {
        const broker: Broker = brokers.find((broker: Broker) => broker.name === combination.broker);
        const fund: Fund = funds.find((fund: Fund) => fund.symbol === combination.fund);

        const simulation = new Simulation(
            new WealthTax(),
            broker,
            fund,
            initialInvestment,
            monthlyInvestment,
            expectedYearlyReturn
        );

        simulation.run(years);

        const row = tableBody.insertRow();

        let brokerInfo = [];

        if (broker.baseFee.isGreaterThan(0)) {
            brokerInfo.push('Basisfee: ' + formatMoney(broker.baseFee) + ' p.j.');
        }

        for (let tier of broker.serviceFee.tiers) {
            let line = 'Servicekosten';
            if (tier.upperLimit) {
                line += ' t/m ' + moneyFormatter.format(tier.upperLimit);
            } else {
                line += ' daarboven';
            }
            line += ': ' + percentageFormatter.format(tier.fee);
            brokerInfo.push(line);
        }

        brokerInfo.push('Transactiekosten: ' + percentageFormatter.format(broker.transactionFee));


        row.insertCell().innerHTML = [broker.name, broker.product].join(' ').trim() + ' <span class="info" title="' + brokerInfo.join('\n') + '"></span>';

        let fundCostInfo = 'Lopende kosten: ' + percentageFormatter.format(fund.totalExpenseRatio);
        if (fund.dividendLeakage > 0) {
            fundCostInfo += '\nDividendlek: ' + percentageFormatter.format(fund.dividendLeakage);
        }
        row.insertCell().innerHTML = fund.symbol + ' (' + fund.isin + ') <span class="info" title="' + fundCostInfo + '"></span>';


        row.insertCell().innerText = combination.automatedInvesting ? 'ja' : 'nee';
        row.insertCell().innerText = formatMoney(simulation.value);
        row.insertCell().innerText = formatMoney(simulation.totalServiceFees);
        row.insertCell().innerText = formatMoney(simulation.getTotalCosts());
        row.insertCell().innerText = formatMoney(simulation.totalWealthTax);
        row.insertCell().innerText = formatMoney(simulation.getNetProfit());
        row.insertCell().innerText = percentageFormatter.format(simulation.getNetResult());
    });
}

form.onchange = () => runSimulation();
window.onload = () => runSimulation();
