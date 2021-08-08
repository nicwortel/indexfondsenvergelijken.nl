import {Money} from "bigint-money/dist";
import {Fee} from "./Fee";

export class DeductibleFee implements Fee {
    private transactionCosts: Money = new Money(0, 'EUR');

    constructor(private innerFee: Fee) {
    }

    public calculateFor(amount: Money): Money {
        const serviceFee = this.innerFee.calculateFor(amount);
        const deductedFee = serviceFee.subtract(this.transactionCosts);

        if (deductedFee.isLesserThan(0)) {
            return new Money(0, 'EUR');
        }

        return deductedFee;
    }

    public describe(): string {
        return '';
    }

    public getExtendedDescription(): string[] {
        return this.innerFee.getExtendedDescription().concat(['Te verminderen met de gemaakte transactiekosten']);
    }

    public updateLastTransactionCosts(transactionCosts: Money): void {
        this.transactionCosts = transactionCosts;
    }
}
