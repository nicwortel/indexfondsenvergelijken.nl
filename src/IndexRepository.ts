import indices from "../data/indices.json";
import {Index} from "./Index/Index";

export class IndexRepository {
    public getByName(name: string): Index {
        const index = indices.find((index: Index) => index.name === name);

        if (index === undefined) {
            return new Index(name, '', []);
        }

        return new Index(index.name, index.markets, index.sizes);
    }
}
