import { Money } from 'bigint-money';
import { NumberFormatter } from '../NumberFormatter';
import type { Fee } from './Fee';

export class PercentageFee implements Fee {
  constructor(public percentage: number) {}

  public calculateFor(amount: Money): Money {
    return amount.multiply(this.percentage.toString()).divide(100);
  }

  public describe(): string {
    const numberFormatter = new NumberFormatter();

    return numberFormatter.formatPercentage(this.percentage / 100, 3);
  }

  public getExtendedDescription(): string[] {
    return [this.describe()];
  }
}
