import {Portfolio} from "./Portfolio";
import {Simulation} from "./Simulation";

export class PortfolioSimulation {
    constructor(public portfolio: Portfolio, public simulations: Simulation[]) {
    }

    public getBestResult(): number {
        return this.simulations[0].getNetResult();
    }
}
