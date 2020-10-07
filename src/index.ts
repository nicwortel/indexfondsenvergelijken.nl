import {Money} from "bigint-money/dist";
import 'bootstrap/js/src/popover';
import 'bootstrap/js/src/tab';
import $ from 'jquery';
import combinationData from "../data/combinations.json";
import {BrokerRepository} from "./BrokerRepository";
import {Combination} from "./Combination";
import {FundRepository} from "./FundRepository";
import {IndexRepository} from "./IndexRepository";
import {NumberFormatter} from "./NumberFormatter";
import {Percentage} from "./Percentage";
import {Portfolio} from "./Portfolio";
import {Simulation} from "./Simulation";
import {View} from "./View";
import {WealthTax} from "./WealthTax";

// Assume that if JavaScript doesn't load it's because of outdated browser (Safari 13)
$('#outdated-browser').hide();

const brokerRepository = new BrokerRepository();
const fundRepository = new FundRepository(new IndexRepository());
const numberFormatter = new NumberFormatter();

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('form');

function getInputValue(elementId: string): number {
    const field: HTMLInputElement = <HTMLInputElement>document.getElementById(elementId);

    return parseFloat(field.value);
}

const combinations: Combination[] = combinationData.map(function (combination: { broker: string, portfolio: { allocation: number, fund: string }[], automatedInvesting: boolean }): Combination {
    const broker = brokerRepository.getBroker(combination.broker);
    const funds = combination.portfolio.map(function (portfolio) {
        return {allocation: new Percentage(portfolio.allocation), fund: fundRepository.getFund(portfolio.fund)};
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

function runSimulation(combinations: Combination[]): void {
    const monthlyInvestment = new Money(getInputValue('monthly'), 'EUR');
    let initialInvestment = monthlyInvestment;

    const differentInitialInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById('differentInitialInvestment');
    if (differentInitialInvestmentElement.checked) {
        initialInvestment = new Money(getInputValue('initial'), 'EUR');
    }
    const years = getInputValue('years');
    const expectedYearlyReturn = new Percentage(getInputValue('return'));

    const totalInvestment = initialInvestment.add(monthlyInvestment.multiply(12 * years - 1));
    document.getElementById('totalInvestment').innerText = numberFormatter.formatMoney(totalInvestment);
    for (let element of document.getElementsByClassName('years')) {
        element.innerHTML = years.toString();
    }

    const subtractServiceFeesFromInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById('subtractServiceFeesFromInvestment');
    const automatedInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById('automatedInvestment');
    const smallCapsCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById('smallCaps');

    if (automatedInvestmentElement.checked) {
        combinations = combinations.filter((combination: Combination) => combination.automatedInvesting === true);
    }

    if (smallCapsCheckbox.checked) {
        combinations = combinations.filter((combination: Combination) => combination.portfolio.containsSmallCaps());
    }

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

    const view = new View(<HTMLDivElement>document.getElementById('results'), new NumberFormatter());
    view.update(results);

    $('.nav-tabs a.nav-link').on('click', function (e) {
        e.preventDefault();

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $($(this).attr('href')).removeClass('active');
            return;
        }

        $(this).tab('show');
    });
}

form.onchange = function () {
    runSimulation(combinations);
}

window.onload = function () {
    $('#differentInitialInvestment').on('change', function () {
        $('#initial').prop('disabled', !$(this).prop('checked'));
    });
    runSimulation(combinations);
};
