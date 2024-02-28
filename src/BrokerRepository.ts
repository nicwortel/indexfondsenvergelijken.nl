import { Broker } from './Broker';
import brokers from '../data/brokers.json';
import { FeeFactory } from './Pricing/FeeFactory';

export class BrokerRepository {
  public getAll(): Array<Broker> {
    return brokers.map(function (data): Broker {
      const feeFactory = new FeeFactory();

      const serviceFee = feeFactory.create(data.serviceFee);
      const mutualFundTransactionFee = feeFactory.create(
        data.mutualFundTransactionFee
      );
      const etfTransactionFee = feeFactory.create(data.etfTransactionFee);
      const dividendDistributionFee = feeFactory.create(
        data.dividendDistributionFee
      );

      return new Broker(
        data.name,
        data.product,
        serviceFee,
        (data.serviceFeeFrequency as 'monthly' | 'quarterly' | undefined) ??
          'quarterly',
        data.serviceFeeCalculation as
          | 'averageEndOfMonth'
          | 'averageOfQuarter'
          | 'endOfQuarter',
        mutualFundTransactionFee,
        etfTransactionFee,
        dividendDistributionFee,
        data.costOverview,
        data.logo ? data.logo : undefined,
        data.website,
        data.affiliateLink
      );
    });
  }

  public getBroker(name: string): Broker {
    return this.getAll().find((broker: Broker) => broker.name === name)!;
  }
}
