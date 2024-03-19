import { Money } from 'bigint-money';
import { NumberFormatter } from '../NumberFormatter';
import type { Fee } from './Fee';

export class TieredFee implements Fee {
  constructor(private tiers: Tier[]) {}

  calculateFor(amount: Money): Money {
    let totalAmount: Money = new Money(0, 'EUR');
    let previousTierLimit: Money = new Money(0, 'EUR');

    for (let tier of this.tiers) {
      let tierAmount: Money;

      if (tier.tierLimit !== null) {
        tierAmount = tier.tierLimit.isLesserThan(amount)
          ? tier.tierLimit
          : amount;
      } else {
        tierAmount = amount;
      }
      tierAmount = tierAmount.subtract(previousTierLimit);

      if (amount.isLesserThanOrEqual(previousTierLimit)) {
        break;
      }

      let tierFee = tier.fee.calculateFor(tierAmount);

      totalAmount = totalAmount.add(tierFee.toFixed(2));
      previousTierLimit = tier.tierLimit!;
    }

    return totalAmount;
  }

  public describe(): string {
    return '';
  }

  public getExtendedDescription(): string[] {
    const numberFormatter = new NumberFormatter();

    return this.tiers.map((tier: Tier): string => {
      if (tier.tierLimit === null) {
        return 'daarboven: ' + tier.fee.describe();
      }

      return (
        't/m ' +
        numberFormatter.formatMoney(tier.tierLimit, 0) +
        ': ' +
        tier.fee.describe()
      );
    });
  }
}

export class Tier {
  constructor(public tierLimit: Money | null, public fee: Fee) {}
}
