import {Fund} from "./Fund/Fund";

export class FundSelection {
    constructor(
        public name: string,
        public isins: string[]
    ) {
    }

    public contains(fund: Fund): boolean {
        return this.isins.includes(fund.getIsin());
    }
}
