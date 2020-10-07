import {Money} from "bigint-money";
import {Fund} from "./Fund/Fund";

export class Transaction {
    constructor(
        public fund: Fund,
        public amount: Money
    )
    {
    }
}
