import * as Twig from "twig";
import template from '../templates/card.html.twig';
import {NumberFormatter} from "./NumberFormatter";
import {Percentage} from "./Percentage";
import {PortfolioSimulation} from "./PortfolioSimulation";

export class View {
    constructor(private resultsElement: HTMLDivElement, private numberFormatter: NumberFormatter) {
        Twig.extendFilter('money', function (amount: any): string {
            if (typeof amount === "number") {
                return this.numberFormatter.formatMoneyFromNumber(amount, 'EUR', 0);
            }

            return this.numberFormatter.formatMoney(amount);
        }.bind(this));

        Twig.extendFilter('percentage', function (percentage: Percentage, args: any[]): string {
            const formatter = new Intl.NumberFormat('nl-NL', {
                style: 'percent',
                maximumFractionDigits: args[0] ?? 2
            });

            return formatter.format(percentage.getFraction());
        }.bind(this));

        Twig.extendFilter('tagDecimals', function (amount: string): string {
            let parts = amount.split(',');

            parts[1] = '<span class="decimals">' + parts[1] + '</span>';

            return parts.join(',');
        }.bind(this));

        Twig.extendFilter('tagAbbreviations', function (name: string): string {
            const abbreviations: { [key: string]: string } = {
                'EM': 'Emerging Markets',
                'ESG': 'Environmental, Social & Governance',
                'ETF': 'Exchange-traded Fund',
                'FGR': 'Fonds voor Gemene Rekening',
                'FTSE': 'Financial Times Stock Exchange',
                'MSCI': 'Morgan Stanley Capital International',
                'IMI': 'Investable Market Index',
                'UCITS': 'Undertakings for Collective Investment in Transferable Securities'
            };

            for (const abbreviation in abbreviations) {
                name = name.replace(
                    abbreviation,
                    `<abbr title="${abbreviations[abbreviation]}">${abbreviation}</abbr>`
                );
            }

            return name;
        }.bind(this));
    }

    public update(simulations: PortfolioSimulation[]): void {
        this.resultsElement.innerHTML = '';

        const resultsElement = this.resultsElement;

        simulations.forEach((simulation: PortfolioSimulation, index: number): void => {
            const element = document.createElement('div');
            element.innerHTML = template({
                index: index,
                portfolio: simulation.portfolio,
                simulations: simulation.simulations
            });

            resultsElement.appendChild(element);
        }, this);
    }
}
