import {Money} from "bigint-money/dist";
import {Broker} from "../src/Broker";
import {Percentage} from "../src/Percentage";
import {Portfolio} from "../src/Portfolio";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {Simulation} from "../src/Simulation";
import {Tier} from "../src/Tier";
import {TieredFee} from "../src/TieredFee";
import {WealthTax} from "../src/WealthTax";
import {FundFactory} from "./FundFactory";

const fundFactory = new FundFactory();

function createSimulation(initialInvestment: number, monthlyInvestment: number, fundExpenseRatio: number,
                          expectedYearlyReturn: number, serviceFee: number
): Simulation {
    return new Simulation(
        new WealthTax(),
        new Broker(
            'Broker',
            'Product',
            new Money(0, 'EUR'),
            new TieredFee([new Tier(null, new Percentage(serviceFee))]),
            'endOfQuarter',
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
        false
    );
}

test.each([
    [createSimulation(1000, 0, 0, 0, 0), 1, '1000', '0'],
    [createSimulation(1000, 100, 0, 0, 0), 1, '2100', '0'],
    [createSimulation(1000, 100, 0, 0, 0), 2, '3300', '0'],
    [createSimulation(1000, 0, 0, 7, 0), 1, '1070', '0'],
    [createSimulation(1000, 100, 0.15, 7, 0.24), 1, '2205.72', '4.10'],
    [createSimulation(1000, 100, 0.15, 7, 0.24), 2, '3600.89', '11.47'],
    [createSimulation(1000, 100, 0.15, 7, 0.24), 10, '18813.16', '218.38'],
])(
    'Runs simulation',
    (simulation: Simulation, runYears: number, expectedValue: string, expectedServiceFees: string) => {
        simulation.run(runYears);

        expect(simulation.getPortfolioValue().toFixed(2)).toEqual(new Money(expectedValue, 'EUR').toFixed(2));
        expect(simulation.totalServiceFees.toFixed(2)).toEqual(new Money(expectedServiceFees, 'EUR').toFixed(2));
    }
);
