import { MutualFund } from './MutualFund';
import { Percentage } from '../Percentage';
import { Index } from '../Index/Index';
import { Money } from 'bigint-money';

/**
 * A special class for the Meesman Wereldwijd Totaal fund, which has a total
 * expense ratio that varies based on the amount of money invested.
 */
export class MeesmanFund extends MutualFund {
  constructor(
    name: string,
    identifier: string,
    isin: string,
    logo: string,
    totalExpenseRatio: Percentage,
    internalTransactionCosts: Percentage,
    dividendLeak: Percentage,
    index: Index,
    kiid: string,
    factsheet: string,
    esgExclusions: Percentage,
    private reducedTotalExpenseRatio: Percentage
  ) {
    super(
      name,
      identifier,
      isin,
      logo,
      totalExpenseRatio,
      internalTransactionCosts,
      dividendLeak,
      index,
      kiid,
      factsheet,
      esgExclusions
    );
  }

  override getTotalExpenseRatio(totalInvested?: Money): Percentage {
    const discountThreshold: Money = new Money(1000000, 'EUR');

    if (
      totalInvested !== undefined &&
      totalInvested.isGreaterThanOrEqual(discountThreshold)
    ) {
      return this.reducedTotalExpenseRatio;
    }

    return super.getTotalExpenseRatio();
  }

  getTerComment(): string {
    const numberFormatter = new Intl.NumberFormat('nl-nl', {
      minimumFractionDigits: 2,
    });

    return (
      numberFormatter.format(this.reducedTotalExpenseRatio.getPercentage()) +
      '% bij een belegd vermogen van € 1 miljoen of meer'
    );
  }
}
