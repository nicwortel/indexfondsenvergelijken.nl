import funds from "../data/funds.json";
import {Etf} from "./Fund/Etf";
import {Fund} from "./Fund/Fund";
import {MutualFund} from "./Fund/MutualFund";
import {IndexRepository} from "./IndexRepository";
import {Percentage} from "./Percentage";
import {MeesmanFund} from "./Fund/MeesmanFund";

export class FundRepository {
    constructor(private indexRepository: IndexRepository) {
    }

    public getAll(): Fund[] {
        return funds.map((data: any) => {
            require('../assets/images/' + data.logo);

            if (data.type === 'meesman') {
                return new MeesmanFund(
                    data.name,
                    data.symbol,
                    data.isin,
                    data.logo,
                    new Percentage(data.totalExpenseRatio),
                    new Percentage(data.internalTransactionCosts),
                    new Percentage(data.dividendLeakage),
                    this.indexRepository.getByName(data.index),
                    data.kiid,
                    data.factsheet,
                    new Percentage(data.esgExclusions ?? 0),
                    new Percentage(data.reducedTotalExpenseRatio)
                );
            }

            if (data.type === 'mutualFund') {
                return new MutualFund(
                    data.name,
                    data.symbol,
                    data.isin,
                    data.logo,
                    new Percentage(data.totalExpenseRatio),
                    new Percentage(data.internalTransactionCosts),
                    new Percentage(data.dividendLeakage),
                    this.indexRepository.getByName(data.index),
                    data.kiid,
                    data.factsheet,
                    new Percentage(data.esgExclusions ?? 0)
                );
            }

            return new Etf(
                data.name,
                data.symbol,
                data.isin,
                data.logo,
                new Percentage(data.totalExpenseRatio),
                new Percentage(data.internalTransactionCosts),
                new Percentage(data.dividendLeakage),
                this.indexRepository.getByName(data.index),
                data.kiid,
                data.factsheet
            );
        })
    }

    public getFund(identifier: string): Fund {
        return this.getAll().find((fund: Fund) => fund.getIdentifier() === identifier);
    }
}
