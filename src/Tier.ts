import {Percentage} from "./Percentage";

export class Tier {
    constructor(
        public upperLimit: number,
        public percentage: Percentage
    )
    {
    }
}
