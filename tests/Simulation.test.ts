import {Money} from "bigint-money/dist";
import {Broker} from "../src/Broker";
import {Fund} from "../src/Fund";
import {Index} from "../src/Index/Index";
import {Portfolio} from "../src/Portfolio";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {Simulation} from "../src/Simulation";
import {TieredFee} from "../src/TieredFee";
import {WealthTax} from "../src/WealthTax";

function createSimulation(initialInvestment: number, monthlyInvestment: number, fundExpenseRatio: number,
                          expectedYearlyReturn: number, serviceFee: number
): Simulation {
    return new Simulation(
        new WealthTax(),
        new Broker(
            'Broker',
            'Product',
            new Money(0, 'EUR'),
            new TieredFee([{upperLimit: null, fee: serviceFee}]),
            'endOfQuarter',
            new PercentageFee(0),
            ''
        ),
        new Portfolio([{
            allocation: 100,
            fund: new Fund('Fund', 'FND', 'ISIN', '', fundExpenseRatio, 0, 0, new Index('Foo', '', [], ''), '', '', 3)
        }]),
        new Money(initialInvestment, 'EUR'),
        new Money(monthlyInvestment, 'EUR'),
        expectedYearlyReturn,
        false
    );
}

test.each([
    [createSimulation(1000, 0, 0, 0, 0), 1, '1000', '0'],
    [createSimulation(1000, 100, 0, 0, 0), 1, '2100', '0'],
    [createSimulation(1000, 100, 0, 0, 0), 2, '3300', '0'],
    [createSimulation(1000, 0, 0, 0.07, 0), 1, '1070', '0'],
    [createSimulation(1000, 100, 0.0015, 0.07, 0.0024), 1, '2205.72', '4.10'],
    [createSimulation(1000, 100, 0.0015, 0.07, 0.0024), 2, '3600.89', '11.47'],
    [createSimulation(1000, 100, 0.0015, 0.07, 0.0024), 10, '18813.16', '218.38'],
])('Runs simulation', (simulation: Simulation, runYears: number, expectedValue: string, expectedServiceFees: string) => {
    simulation.run(runYears);

    expect(simulation.value.toFixed(2)).toEqual(new Money(expectedValue, 'EUR').toFixed(2));
    expect(simulation.totalServiceFees.toFixed(2)).toEqual(new Money(expectedServiceFees, 'EUR').toFixed(2));
});
