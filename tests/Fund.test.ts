import {Fund} from "../src/Fund";
import {Index} from "../src/Index/Index";
import {Percentage} from "../src/Percentage";

test('Returns the total fund costs', () => {
    const index = new Index('Index', '', [], '');
    const fund = new Fund('Name', 'SYM', 'ISIN', "", new Percentage(0.1), new Percentage(0.2), new Percentage(0), index, '', '', 1);

    expect(fund.getTotalCosts().getPercentage()).toBeCloseTo(0.3);
})
