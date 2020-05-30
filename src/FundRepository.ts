import funds from "../data/funds.json";
import {Fund} from "./Fund";

export class FundRepository {
    public getAll(): Array<Fund> {
        return funds.map(function (data: any): Fund {
            return new Fund(
                data.name,
                data.symbol,
                data.isin,
                data.totalExpenseRatio,
                data.dividendLeakage,
                data.entryFee ?? 0
            );
        })
    }

    public getFund(symbol: string): Fund {
        return this.getAll().find((fund: Fund) => fund.symbol === symbol);
    }
}
