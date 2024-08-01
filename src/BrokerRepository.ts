import {Broker} from "./Broker";
import brokers from "../data/brokers.json";
import fundSelectionsData from "../data/fund_selections.json";
import {FeeFactory} from "./Pricing/FeeFactory";
import {FundSelection} from "./FundSelection";

export class BrokerRepository {
    public getAll(): Array<Broker> {
        return brokers.map(function (data: any): Broker {
            const feeFactory = new FeeFactory();

            const serviceFee = feeFactory.create(data.serviceFee);
            const mutualFundTransactionFee = feeFactory.create(data.mutualFundTransactionFee);
            const etfTransactionFee = feeFactory.create(data.etfTransactionFee);
            const selectionMutualFundTransactionFee = feeFactory.create(data.selectionMutualFundTransactionFee);
            const selectionEtfTransactionFee = feeFactory.create(data.selectionEtfTransactionFee);
            const dividendDistributionFee = feeFactory.create(data.dividendDistributionFee);

            if (data.logo) {
                require('../assets/images/' + data.logo);
            }

            const fundSelections: FundSelection[] = fundSelectionsData.filter((fundSelection: any) => fundSelection.broker === data.name).map((fundSelection: any) => {
                return new FundSelection(fundSelection.name, fundSelection.isins);
            });

            return new Broker(
                data.name,
                data.product,
                serviceFee,
                data.serviceFeeFrequency ?? 'quarterly',
                data.serviceFeeCalculation,
                mutualFundTransactionFee,
                etfTransactionFee,
                selectionMutualFundTransactionFee,
                selectionEtfTransactionFee,
                fundSelections,
                dividendDistributionFee,
                data.costOverview,
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
