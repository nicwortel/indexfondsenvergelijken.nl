import {Money} from "bigint-money";
import {Broker} from "./Broker";
import {Percentage} from "./Percentage";
import {Portfolio} from "./Portfolio";
import {PortfolioSimulation} from "./PortfolioSimulation";
import {SimulatedPortfolio} from "./SimulatedPortfolio";
import {Simulation} from "./Simulation";

export class Simulator {
    public runSimulations(
        portfolios: Portfolio[],
        initialInvestment: Money,
        monthlyInvestment: Money,
        expectedYearlyReturn: Percentage,
        expectedDividendYield: Percentage,
        years: number
    ): PortfolioSimulation[]
    {
        let portfolioSimulations = portfolios.map((portfolio: Portfolio): PortfolioSimulation => {
            let simulations = portfolio.brokers.map((broker: Broker) => {
                const simulation = new Simulation(
                    broker,
                    new SimulatedPortfolio(portfolio.assets),
                    initialInvestment,
                    monthlyInvestment,
                    expectedYearlyReturn,
                    expectedDividendYield
                );

                simulation.run(years);

                return simulation;
            });

            simulations = simulations.sort((a, b) => b.getNetResult() - a.getNetResult());

            return new PortfolioSimulation(portfolio, simulations);
        });

        portfolioSimulations = portfolioSimulations.sort((a, b) => b.getBestResult() - a.getBestResult());

        return portfolioSimulations;
    }
}
