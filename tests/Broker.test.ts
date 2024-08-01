import {Money} from "bigint-money";
import {Broker} from "../src/Broker";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {Tier, TieredFee} from "../src/Pricing/TieredFee";
import {Transaction} from "../src/Transaction";
import {FundFactory} from "./FundFactory";
import {NullFee} from "../src/Pricing/NullFee";
import {FundSelection} from "../src/FundSelection";
import {FlatFee} from "../src/Pricing/FlatFee";

const fundFactory = new FundFactory();

test('Calculates the cost of a transaction', () => {
    const baseFee = new Money(0, 'EUR');
    const serviceFee = new TieredFee([new Tier(null, new PercentageFee(0))]);

    const broker = new Broker(
        'TestBroker',
        'Product',
        serviceFee,
        'quarterly',
        'averageEndOfMonth',
        new PercentageFee(1),
        new PercentageFee(1),
        new NullFee(),
        new NullFee(),
        [],
        new PercentageFee(0),
        ''
    );

    const transactionCosts = broker.getTransactionCosts(new Transaction(fundFactory.createMutualFund(), new Money(100, 'EUR')));

    expect(transactionCosts).toEqual(new Money(1, 'EUR'));
});

test('Calculates the transaction cost of a fund from a fund selection', () => {
    const baseFee = new Money(0, 'EUR');
    const serviceFee = new TieredFee([new Tier(null, new PercentageFee(0))]);

    const broker = new Broker(
        'TestBroker',
        'Product',
        serviceFee,
        'quarterly',
        'averageEndOfMonth',
        new FlatFee(new Money(10, 'EUR')),
        new FlatFee(new Money(10, 'EUR')),
        new FlatFee(new Money(1, 'EUR')),
        new FlatFee(new Money(1, 'EUR')),
        [
            new FundSelection('Kernselectie', ['NL0011223333', 'NL0011223334'])
        ],
        new PercentageFee(0),
        ''
    );

    const fund = fundFactory.createMutualFund(0, 0, 0, 0, 'NL0011223333');
    const transactionCosts = broker.getTransactionCosts(new Transaction(fund, new Money(100, 'EUR')));

    expect(transactionCosts).toEqual(new Money(1, 'EUR'));
});
