import funds from "../data/funds.json";
import {Fund} from "./Fund";
import {IndexRepository} from "./IndexRepository";

export class FundRepository {
    constructor(private indexRepository: IndexRepository) {
    }

    public getAll(): Array<Fund> {
        return funds.map((data: any) => {
            return new Fund(
                data.name,
                data.symbol,
                data.isin,
                data.totalExpenseRatio,
                data.dividendLeakage,
                data.entryFee ?? 0,
                this.indexRepository.getByName(data.index),
                data.kiid,
                data.factsheet,
                data.shares ?? 0
            );
        })
    }

    public getFund(symbol: string): Fund {
        return this.getAll().find((fund: Fund) => fund.symbol === symbol);
    }
}
