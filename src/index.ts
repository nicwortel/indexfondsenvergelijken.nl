import {Money} from "bigint-money/dist";
import 'bootstrap/js/src/collapse';
import '../assets/stylesheets/main.scss';
import {BrokerRepository} from "./BrokerRepository";
import {FundRepository} from "./FundRepository";
import {IndexRepository} from "./IndexRepository";
import {NumberFormatter} from "./NumberFormatter";
import {Percentage} from "./Percentage";
import {Portfolio} from "./Portfolio";
import {PortfolioRepository} from "./PortfolioRepository";
import {Simulator} from "./Simulator";
import {View} from "./View";

// Assume that if JavaScript doesn't load it's because of outdated browser (Safari 13)
document.getElementById('outdated-browser').hidden = true;

const brokerRepository = new BrokerRepository();
const fundRepository = new FundRepository(new IndexRepository());
const portfolioRepository = new PortfolioRepository(fundRepository, brokerRepository);
const numberFormatter = new NumberFormatter();

const form: HTMLFormElement = <HTMLFormElement>document.getElementById('form');

function getInputValue(elementId: string): number {
    const field: HTMLInputElement = <HTMLInputElement>document.getElementById(elementId);

    return parseFloat(field.value);
}

const portfolios: Portfolio[] = portfolioRepository.getAll();

function runSimulation(portfolios: Portfolio[]): void {
    document.getElementById('totalPortfolios').innerText = portfolios.length.toString();

    const monthlyInvestment = new Money(getInputValue('monthly'), 'EUR');
    let initialInvestment = monthlyInvestment;

    const differentInitialInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById(
        'differentInitialInvestment');
    if (differentInitialInvestmentElement.checked) {
        initialInvestment = new Money(getInputValue('initial'), 'EUR');
    }
    const years = getInputValue('years');
    const expectedYearlyReturn = new Percentage(getInputValue('return'));
    const expectedDividendYield = new Percentage(getInputValue('dividendYield'));

    const totalInvestment = initialInvestment.add(monthlyInvestment.multiply(12 * years - 1));
    document.getElementById('totalInvestment').innerText = numberFormatter.formatMoney(totalInvestment);
    for (let element of document.getElementsByClassName('years')) {
        element.innerHTML = years.toString();
    }

    const automatedInvestmentElement: HTMLInputElement = <HTMLInputElement>document.getElementById('automatedInvestment');
    const smallCapsCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById('smallCaps');

    const minimumMarketCap = getInputValue('minimumMarketCap');
    portfolios = portfolios.filter((portfolio: Portfolio) => portfolio.getMarketCapPercentage().getPercentage() >= minimumMarketCap);

    // if (automatedInvestmentElement.checked) {
    //     combinations = combinations.filter((combination: Combination) => combination.automatedInvesting === true);
    // }

    // if (smallCapsCheckbox.checked) {
    //     combinations = combinations.filter((combination: Combination) => combination.portfolio.containsSmallCaps());
    // }

    const simulator = new Simulator();

    const simulations = simulator.runSimulations(
        portfolios,
        initialInvestment,
        monthlyInvestment,
        expectedYearlyReturn,
        expectedDividendYield,
        years
    );

    document.getElementById('shownPortfolios').innerText = portfolios.length.toString();

    const view = new View(<HTMLDivElement>document.getElementById('results'), new NumberFormatter());
    view.update(simulations);
}

if (form) {
    form.onchange = function () {
        if (form.checkValidity()) {
            runSimulation(portfolios);
        }
    }

    window.onload = function () {
        document.getElementById('differentInitialInvestment').addEventListener('change', function () {
            return document.getElementById('initial').toggleAttribute('disabled');
        });

        runSimulation(portfolios);
    };
}

declare global {
    interface Window {
        _paq: any;
    }
}

let _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function () {
    var u = "https://stats.nicwortel.nl/";
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', 2]);
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.src = u + 'matomo.js';
    s.parentNode.insertBefore(g, s);
})();
