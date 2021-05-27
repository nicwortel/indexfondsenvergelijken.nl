import {Money} from "bigint-money";
import {Broker} from "../src/Broker";
import {Percentage} from "../src/Percentage";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {Tier} from "../src/Tier";
import {TieredFee} from "../src/TieredFee";
import {Transaction} from "../src/Transaction";
import {FundFactory} from "./FundFactory";

const fundFactory = new FundFactory();

test('Calculates the cost of a transaction', () => {
    const baseFee = new Money(0, 'EUR');
    const serviceFee = new TieredFee([new Tier(0, new Percentage(0))]);

    const broker = new Broker(
        'TestBroker',
        'Product',
        baseFee,
        serviceFee,
        'averageEndOfMonth',
        new PercentageFee(1),
        new PercentageFee(1),
        new PercentageFee(0),
        ''
    );

    const transactionCosts = broker.getTransactionCosts(new Transaction(fundFactory.createMutualFund(), new Money(100, 'EUR')));

    expect(transactionCosts).toEqual(new Money(1, 'EUR'));
});
