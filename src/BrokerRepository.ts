import {Broker} from "./Broker";
import brokers from "../data/brokers.json";
import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";

export class BrokerRepository {
    public getAll(): Array<Broker> {
        return brokers.map(function (data: any): Broker {
            if (!data.serviceFee) {
                data.serviceFee = [];
            }

            const serviceFee: TieredFee = new TieredFee(data.serviceFee);

            return new Broker(
                data.name,
                data.product,
                new Money(data.baseFee.toString(), 'EUR'),
                serviceFee,
                data.transactionFee ?? 0,
                data.costOverview,
                data.minimumServiceFee ? new Money(data.minimumServiceFee, 'EUR') : null,
                data.maximumServiceFee ? new Money(data.maximumServiceFee, 'EUR') : null
            );
        })
    }

    public getBroker(name: string): Broker {
        return this.getAll().find((broker: Broker) => broker.name === name);
    }
}
