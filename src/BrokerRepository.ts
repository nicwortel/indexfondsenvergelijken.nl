import {Broker} from "./Broker";
import brokers from "../data/brokers.json";
import {Percentage} from "./Percentage";
import {FeeFactory} from "./Pricing/FeeFactory";
import {Tier} from "./Tier";
import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";

export class BrokerRepository {
    public getAll(): Array<Broker> {
        return brokers.map(function (data: any): Broker {
            let tiers = data.serviceFee ?? [];

            tiers = tiers.map((tier: {upperLimit: number, percentage: number}) => new Tier(tier.upperLimit, new Percentage(tier.percentage)));

            const serviceFee: TieredFee = new TieredFee(tiers);

            const feeFactory = new FeeFactory();

            const mutualFundTransactionFee = feeFactory.create(data.mutualFundTransactionFee);
            const etfTransactionFee = feeFactory.create(data.etfTransactionFee);

            if (data.logo) {
                require('../assets/images/' + data.logo);
            }

            return new Broker(
                data.name,
                data.product,
                new Money(data.baseFee.toString(), 'EUR'),
                serviceFee,
                data.serviceFeeCalculation,
                mutualFundTransactionFee,
                etfTransactionFee,
                data.costOverview,
                data.minimumServiceFee ? new Money(data.minimumServiceFee, 'EUR') : null,
                data.maximumServiceFee ? new Money(data.maximumServiceFee, 'EUR') : null,
                data.logo ? data.logo : null,
                data.website,
                data.affiliateLink
            );
        })
    }

    public getBroker(name: string): Broker {
        return this.getAll().find((broker: Broker) => broker.name === name);
    }
}
