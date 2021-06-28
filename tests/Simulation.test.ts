import {Money} from "bigint-money/dist";
import {Broker} from "../src/Broker";
import {Percentage} from "../src/Percentage";
import {Portfolio} from "../src/Portfolio";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {Tier, TieredFee} from "../src/Pricing/TieredFee";
import {Simulation} from "../src/Simulation";
import {WealthTax} from "../src/WealthTax";
import {FundFactory} from "./FundFactory";

const fundFactory = new FundFactory();

function createSimulation(initialInvestment: number, monthlyInvestment: number, fundExpenseRatio: number,
                          expectedYearlyReturn: number, expectedDividendYield: number, serviceFee: number
): Simulation {
    return new Simulation(
        new WealthTax(),
        new Broker(
            'Broker',
            'Product',
            new TieredFee([new Tier(null, new PercentageFee(serviceFee))]),
            'quarterly',
            'endOfQuarter',
            new PercentageFee(0),
            new PercentageFee(0),
            new PercentageFee(0),
            ''
        ),
        new Portfolio([{
            allocation: new Percentage(100),
            fund: fundFactory.createMutualFund(fundExpenseRatio, 0)
        }]),
        new Money(initialInvestment, 'EUR'),
        new Money(monthlyInvestment, 'EUR'),
        new Percentage(expectedYearlyReturn),
        new Percentage(expectedDividendYield)
    );
}

test.each([
    [createSimulation(1000, 0, 0, 0, 0, 0), 1, '1000', '0'],
    [createSimulation(1000, 100, 0, 0, 0, 0), 1, '2100', '0'],
    [createSimulation(1000, 100, 0, 0, 0, 0), 2, '3300', '0'],
    [createSimulation(1000, 0, 0, 5, 2, 0), 1, '1071.16', '0'],
    [createSimulation(1000, 100, 0.15, 7, 2, 0.06), 1, '2236.61', '4.14'],
    [createSimulation(1000, 100, 0.15, 7, 2, 0.06), 2, '3690.05', '11.67'],
    [createSimulation(1000, 100, 0.15, 7, 2, 0.06), 10, '20958.22', '235.25'],
])(
    'Runs simulation',
    (simulation: Simulation, runYears: number, expectedValue: string, expectedServiceFees: string) => {
        simulation.run(runYears);

        expect(simulation.getPortfolioValue().toFixed(2)).toEqual(new Money(expectedValue, 'EUR').toFixed(2));
        expect(simulation.totalServiceFees.toFixed(2)).toEqual(new Money(expectedServiceFees, 'EUR').toFixed(2));
    }
);
