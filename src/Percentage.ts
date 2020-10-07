import {Money} from "bigint-money";

export class Percentage {
    constructor(
        private percentage: number
    )
    {
    }

    public static createFromFraction(fraction: number): Percentage {
        return new Percentage(fraction * 100);
    }

    public getPercentage(): number {
        return this.percentage;
    }

    public getFraction(): number {
        return this.percentage / 100;
    }

    public add(other: Percentage): Percentage {
        return new Percentage(this.percentage + other.percentage);
    }

    public subtract(other: Percentage): Percentage {
        return new Percentage(this.percentage - other.percentage);
    }

    public multiply(other: Percentage): Percentage {
        return new Percentage((this.percentage * other.percentage) / 100);
    }

    public applyTo(amount: Money): Money {
        return amount.multiply(this.getFraction().toString());
    }

    public equals(other: Percentage): boolean {
        return this.percentage === other.percentage;
    }
}
