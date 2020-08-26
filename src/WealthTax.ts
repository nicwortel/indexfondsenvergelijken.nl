import {TieredFee} from "./TieredFee";
import {Money} from "bigint-money/dist";

export class WealthTax {
    // Heffingsvrij vermogen
    // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/belasting_betalen_over_uw_vermogen/heffingsvrij_vermogen/heffingsvrij_vermogen
    private taxFreeCapital = 30846;

    // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/vermogen_en_aanmerkelijk_belang/vermogen/belasting_betalen_over_uw_vermogen/grondslag_sparen_en_beleggen/berekening-2020/
    private tiers = new TieredFee([
        {upperLimit: 72798, fee: 0.01789},
        {upperLimit: 1005573, fee: 0.04185},
        {upperLimit: null, fee: 0.0528}
    ])

    private tax = 0.3;

    public getTaxAmount(capital: Money): Money {
        // The tax free capital is deducted from the amount
        const taxableCapital = capital.subtract(this.taxFreeCapital);

        const fictionalReturns = this.tiers.calculateFee(taxableCapital);

        const taxAmount = fictionalReturns.multiply(this.tax.toString());

        return new Money(taxAmount.toFixed(2).replace(/\.?[0-9]+$/, ''), taxAmount.currency);
    }
}
