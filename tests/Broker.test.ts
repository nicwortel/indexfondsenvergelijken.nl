import {Money} from "bigint-money";
import {Broker} from "../src/Broker";
import {PercentageFee} from "../src/Pricing/PercentageFee";
import {TieredFee} from "../src/TieredFee";

test('Calculates the cost of a transaction', () => {
    const baseFee = new Money(0, 'EUR');
    const serviceFee = new TieredFee([{upperLimit: 0, fee: 0}]);

    const broker = new Broker(
        'TestBroker',
        'Product',
        baseFee,
        serviceFee,
        'averageEndOfMonth',
        new PercentageFee(1),
        ''
    );

    const transactionCosts = broker.getTransactionCosts(new Money(100, 'EUR'));

    expect(transactionCosts).toEqual(new Money(1, 'EUR'));
});
