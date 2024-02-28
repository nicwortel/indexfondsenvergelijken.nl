import { Money } from 'bigint-money';
import { derived, writable } from 'svelte/store';
import { BrokerRepository } from '../BrokerRepository';
import { FundRepository } from '../FundRepository';
import { IndexRepository } from '../IndexRepository';
import { NumberFormatter } from '../NumberFormatter';
import { Percentage } from '../Percentage';
import type { Portfolio } from '../Portfolio';
import { PortfolioRepository } from '../PortfolioRepository';
import { Simulator } from '../Simulator';

const brokerRepository = new BrokerRepository();
const fundRepository = new FundRepository(new IndexRepository());
const portfolioRepository = new PortfolioRepository(
  fundRepository,
  brokerRepository
);

const portfolios: Portfolio[] = portfolioRepository.getAll();

export const numberFormatter = new NumberFormatter();

export const formStore = writable({
  differentInitialInvestment: false,
  monthly: 500,
  years: 20,
  initial: 500,
  returnPercentage: 5,
  dividendYield: 2.5,
  minimumMarketCap: 70,
});

export const portfoliosStore = derived(formStore, ($formStore) => {
  const monthlyInvestment = new Money($formStore.monthly, 'EUR');
  const initialInvestment = $formStore.differentInitialInvestment
    ? new Money($formStore.initial, 'EUR')
    : monthlyInvestment;
  const expectedYearlyReturn = new Percentage($formStore.returnPercentage);
  const expectedDividendYield = new Percentage($formStore.dividendYield);

  const totalInvestment = initialInvestment.add(
    monthlyInvestment.multiply(12 * $formStore.years - 1)
  );

  return {
    monthlyInvestment,
    initialInvestment,
    expectedYearlyReturn,
    expectedDividendYield,
    totalInvestment,
    portfolios,
    filteredPortfolios: portfolios.filter(
      (portfolio) =>
        portfolio.getMarketCapPercentage().getPercentage() >=
        $formStore.minimumMarketCap
    ),
  };
});

export const simulationStore = derived(
  [formStore, portfoliosStore],
  ([$formStore, $portfoliosStore]) => {
    const simulator = new Simulator();
    const simulations = simulator.runSimulations(
      $portfoliosStore.filteredPortfolios,
      $portfoliosStore.initialInvestment,
      $portfoliosStore.monthlyInvestment,
      $portfoliosStore.expectedYearlyReturn,
      $portfoliosStore.expectedDividendYield,
      $formStore.years
    );
    return simulations;
  }
);
