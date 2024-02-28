import indices from '../data/indices.json';
import { Index } from './Index/Index';
import { Percentage } from './Percentage';

export class IndexRepository {
  public getByName(name: string): Index {
    const index = indices.find((index) => index.name === name);

    if (index === undefined) {
      return new Index(name, '', '', [], new Percentage(0), '');
    }

    return new Index(
      index.name,
      index.factsheet,
      index.markets,
      index.sizes,
      new Percentage(index.percentageOfTotalMarketCapitalization),
      undefined
    );
  }
}
