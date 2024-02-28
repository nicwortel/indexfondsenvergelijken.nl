import portfolios from "../data/portfolios.json";
import {BrokerRepository} from "./BrokerRepository";
import {FundRepository} from "./FundRepository";
import {Percentage} from "./Percentage";
import {Portfolio} from "./Portfolio";

export class PortfolioRepository {
    constructor(private fundRepository: FundRepository, private brokerRepository: BrokerRepository) {
    }

    public getAll(): Portfolio[] {
        return portfolios.map((data) => {
            const assets = data.portfolio.map((asset) => {
                return {allocation: new Percentage(asset.allocation), fund: this.fundRepository.getFund(asset.fund)};
            })

            const brokers = data.brokers.map((broker: string) => this.brokerRepository.getBroker(broker));

            return new Portfolio(assets, brokers);
        });
    }
}
