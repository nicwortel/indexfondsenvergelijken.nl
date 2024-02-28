import { Money } from 'bigint-money';
import type { Fee } from './Fee';

export class NullFee implements Fee {
  public calculateFor(amount: Money): Money {
    return new Money(0, amount.currency);
  }

  public describe(): string {
    return 'geen';
  }

  public getExtendedDescription(): string[] {
    return [];
  }
}
