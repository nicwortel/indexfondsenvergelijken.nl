import {Money} from "bigint-money/dist";
import 'bootstrap/js/src/popover';
import $ from 'jquery';
import combinationData from "../data/combinations.json";
import {BrokerRepository} from "./BrokerRepository";
import {Combination} from "./Combination";
import {Fund} from "./Fund";
import {FundRepository} from "./FundRepository";
import {NumberFormatter} from "./NumberFormatter";
import {Portfolio} from "./Portfolio";
import {Simulation} from "./Simulation";
import {WealthTax} from "./WealthTax";

const brokerRepository = new BrokerRepository();
const fundRepository = new FundRepository();
const numberFormatter = new NumberFormatter('nl-NL');

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('form');

function getInputValue(elementId: string): number {
    const field: HTMLInputElement = <HTMLInputElement>document.getElementById(elementId);

    return parseFloat(field.value);
}

const combinations: Combination[] = combinationData.map(function (combination: { broker: string, portfolio: { allocation: number, fund: string }[], automatedInvesting: boolean }): Combination {
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
    const monthlyInvestment = new Money(getInputValue('monthly'), 'EUR');
    let initialInvestment = monthlyInvestment;

    const differentInitialInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById('differentInitialInvestment');
    if (differentInitialInvestmentElement.checked) {
        initialInvestment = new Money(getInputValue('initial'), 'EUR');
    }
    const years = getInputValue('years');
    const expectedYearlyReturn = getInputValue('return') / 100;

    const totalInvestment = initialInvestment.add(monthlyInvestment.multiply(12 * years - 1));
    document.getElementById('totalInvestment').innerText = numberFormatter.formatMoney(totalInvestment);
    for (let element of document.getElementsByClassName('years')) {
        element.innerHTML = years.toString();
    }

    const resultsTable: HTMLTableElement = <HTMLTableElement>document.getElementById('results');
    const tableBody = resultsTable.getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    const subtractServiceFeesFromInvestmentElement: HTMLInputElement = <HTMLInputElement> document.getElementById('subtractServiceFeesFromInvestment');

    let results = combinations.map(function (combination) {
        const simulation = new Simulation(
            new WealthTax(),
            combination.broker,
            combination.portfolio,
            initialInvestment,
            monthlyInvestment,
            expectedYearlyReturn,
            subtractServiceFeesFromInvestmentElement.checked
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
            } else if (combination.broker.serviceFee.tiers.length > 1) {
                line += ' daarboven';
            }
            line += ': ' + numberFormatter.formatPercentage(tier.fee);
            brokerInfo.push(line);
        }

        if (combination.broker.serviceFeeCalculation) {
            let serviceFeeCalculation = 'Berekening servicekosten op basis van: ';
            if (combination.broker.serviceFeeCalculation === 'averageEndOfMonth') {
                serviceFeeCalculation += ' gemiddelde van belegd vermogen aan het eind van elke maand';
            } else if (combination.broker.serviceFeeCalculation === 'endOfQuarter') {
                serviceFeeCalculation += ' belegd vermogen aan het eind van het kwartaal';
            } else if (combination.broker.serviceFeeCalculation === 'averageOfQuarter') {
                serviceFeeCalculation += ' gemiddelde van het belegd vermogen aan het begin en eind van het kwartaal';
            }
            brokerInfo.push(serviceFeeCalculation);
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

        let funds = combination.portfolio.assets.map(function (asset: { allocation: number, fund: Fund }): string {
            let popoverContent = [];

            if (asset.fund.index) {
                popoverContent.push('Index: ' + asset.fund.index);
            }
            popoverContent.push('ISIN: ' + asset.fund.isin);
            popoverContent.push('Aantal aandelen: ' + asset.fund.shares);
            if (asset.fund.entryFee > 0) {
                popoverContent.push('Instapkosten: ' + numberFormatter.formatPercentage(asset.fund.entryFee));
            }
            popoverContent.push('Lopende kosten: ' + numberFormatter.formatPercentage(asset.fund.totalExpenseRatio));
            if (asset.fund.dividendLeakage > 0) {
                popoverContent.push('Dividendlek: ' + numberFormatter.formatPercentage(asset.fund.dividendLeakage));
                popoverContent.push('Totaal jaarlijkse kosten: ' + numberFormatter.formatPercentage(asset.fund.totalExpenseRatio + asset.fund.dividendLeakage));
            }
            let links = [];
            if (asset.fund.factsheet) {
                links.push('<a href=' + asset.fund.factsheet + ' target=_blank>Factsheet</a>');
            }
            if (asset.fund.kiid) {
                links.push('<a href=' + asset.fund.kiid + ' target=_blank>Essentiële Beleggersinformatie</a>');
            }
            if (links.length > 0) {
                popoverContent.push(links.join(' | '));
            }

            return asset.allocation + '% <a title="' + asset.fund.name + '" data-toggle="popover" data-content="' + popoverContent.join('<br>') + '" tabindex="1">' + asset.fund.symbol + '</a>';
        });

        row.insertCell().innerHTML = funds.join(', ') + ' <span class="info" title="Totaal lopende kosten portefeuille: ' + numberFormatter.formatPercentage(combination.portfolio.getTotalCosts(), 3) + '"></span>';

        const shares = combination.portfolio.assets.reduce((sum: number, current) => sum + current.fund.shares, 0);
        row.insertCell().innerText = shares.toString();

        row.insertCell().innerText = combination.automatedInvesting ? 'ja' : 'nee';

        insertMoneyTableCell(row, simulation.value);

        const costsPopover = [
            '<b>Kosten die van de waarde van je beleggingen zijn afgehaald:</b>',
            'Fondskosten: ' + numberFormatter.formatMoney(simulation.totalFundCosts) + ' (TER, dividendlek en instapkosten)',
            'Transactiekosten: ' + numberFormatter.formatMoney(simulation.totalTransactionFees),
            '',
            '<b>Kosten die apart in rekening zijn gebracht:</b>',
            'Servicekosten: ' + numberFormatter.formatMoney(simulation.totalServiceFees),
        ].join('<br/>');
        const costsCell = row.insertCell();
        costsCell.classList.add('text-right');
        costsCell.innerHTML = '<a data-toggle="popover" data-content="' + costsPopover + '" tabindex=1>' + numberFormatter.formatMoney(simulation.getTotalCosts()) + '</a>';

        insertMoneyTableCell(row, simulation.getNetProfit());

        const netResultCell = row.insertCell();
        netResultCell.innerText = numberFormatter.formatPercentage(simulation.getNetResult());
        netResultCell.classList.add('text-right');
    });

    $('[data-toggle="popover"]').popover({
        placement: 'top',
        html: true
    });

    $('body').on('click', function (e) {
        if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover').length === 0) {
            $('[data-toggle="popover"]').popover('hide');
        }
    });
}

function insertMoneyTableCell(row: HTMLTableRowElement, amount: Money): void {
    const cell = row.insertCell();
    cell.innerText = numberFormatter.formatMoney(amount);
    cell.classList.add('text-right');
}

form.onchange = function () {
    runSimulation();
}

window.onload = function () {
    $('#differentInitialInvestment').on('change', function () {
        $('#initial').prop('disabled', !$(this).prop('checked'));
    });
    runSimulation();
};
