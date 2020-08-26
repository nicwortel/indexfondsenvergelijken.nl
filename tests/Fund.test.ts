import {Fund} from "../src/Fund";
import {Index} from "../src/Index/Index";

test('Returns the total fund costs', () => {
    const index = new Index('Index', '', [], '');
    const fund = new Fund('Name', 'SYM', 'ISIN', 0.1, 0.2, 0, index, '', '', 1);
})
