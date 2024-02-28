<script lang="ts">
  import { Money } from 'bigint-money';
  import type { Fund } from '../Fund/Fund';
  import type { MeesmanFund } from '../Fund/MeesmanFund';
  import type { Percentage } from '../Percentage';
  import type { Portfolio } from '../Portfolio';
  import type { Simulation } from '../Simulation';
  import Abbreviations from './Abbreviations.svelte';
  import Decimals from './Decimals.svelte';
  import { numberFormatter, simulationStore } from './simulations';

  const money = (amount: number | Money) =>
    amount instanceof Money
      ? numberFormatter.formatMoney(amount)
      : numberFormatter.formatMoneyFromNumber(amount, 'EUR', 0);
  const percentage = (percentage: Percentage, digits: number = 2) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'percent',

      maximumFractionDigits: digits,
    }).format(percentage.getFraction());
  const terComment = (fund: Fund) =>
    (fund as MeesmanFund).getTerComment?.()
      ? `(${(fund as MeesmanFund).getTerComment()})`
      : '';

  const getYearlyCosts = (portfolio: Portfolio, simulations: Simulation[]) =>
    percentage(
      portfolio.getYearlyCosts(simulations[0]!.getExpectedDividendYield()),
      3
    );
</script>

<div id="results">
  {#each $simulationStore as simulation, index (simulation.portfolio
    .getFundNames()
    .join(''))}
    {@const portfolio = simulation.portfolio}
    {@const simulations = simulation.simulations}
    {@const yearlyCosts = getYearlyCosts(portfolio, simulations)}
    {@const logo = portfolio.assets[0]?.fund.getLogo()}
    {@const loading = index >= 2 ? 'lazy' : 'eager'}

    <div class="card mb-3">
      <div class="card-body pb-1">
        <h2 class="card-title h5">
          <img
            src={`/images/${logo}`}
            width="100"
            height="40"
            alt=""
            class="me-4 object-fit-contain"
            {loading}
          />
          {portfolio.getFundNames().join(' + ')}
        </h2>

        <div class="card-text">
          <div class="row">
            <div class="col">
              <div class="small">Marktkapitalisatie</div>
              <div class="mb-2 fw-bold">
                {percentage(portfolio.getMarketCapPercentage(), 0)}
              </div>
            </div>
            <div class="col mb-2 text-end">
              <div class="small">Fondskosten per jaar</div>
              <div class="fw-bold">{yearlyCosts}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="accordion accordion-flush border-top" id="portfolio-{index}">
        <div class="accordion-item">
          <h2 class="accordion-header" id="portfolio-{index}-portfolio-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#portfolio-{index}-portfolio"
              aria-expanded="true"
              aria-controls="portfolio-{index}-portfolio"
            >
              Portefeuille
            </button>
          </h2>
          <div
            id="portfolio-{index}-portfolio"
            class="accordion-collapse collapse"
            aria-labelledby="portfolio-{index}"
            data-bs-parent="#portfolio-{index}"
          >
            <div class="accordion-body">
              {#each portfolio.assets as asset (asset.fund.getName())}
                <table class="table">
                  <thead>
                    <tr>
                      <th colspan="2"
                        ><Abbreviations name={asset.fund.getName()} />
                        ({percentage(asset.allocation)})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th class="w-25"
                        ><abbr
                          title="International Securities Identification Number"
                          >ISIN</abbr
                        ></th
                      >
                      <td>{asset.fund.getIsin()}</td>
                    </tr>
                    <tr>
                      <th>Index</th>
                      <td>
                        {#if asset.fund.getTrackedIndex().factsheet}<a
                            href={asset.fund.getTrackedIndex().factsheet}
                            target="_blank"
                            ><Abbreviations
                              name={asset.fund.getTrackedIndex().name}
                            /></a
                          >{:else}<Abbreviations
                            name={asset.fund.getTrackedIndex().name}
                          />{/if}
                      </td>
                    </tr>
                    <tr>
                      <th
                        ><abbr title="Environmental, Social & Governance"
                          >ESG</abbr
                        >-uitsluitingen</th
                      >
                      <td
                        >{#if asset.fund
                          .getEsgExclusions()
                          .getPercentage() > 0}{percentage(
                            asset.fund.getEsgExclusions()
                          )} van de marktkapitalisatie van de index{:else}geen{/if}</td
                      >
                    </tr>
                    <tr>
                      <th>Lopende kosten</th>
                      <td
                        >{percentage(asset.fund.getTotalExpenseRatio())}
                        {terComment(asset.fund)}
                      </td>
                    </tr>
                    <tr>
                      <th>Interne transactiekosten</th>
                      <td
                        >{percentage(
                          asset.fund.getInternalTransactionCosts(),
                          3
                        )}</td
                      >
                    </tr>
                    <tr>
                      <th>Dividendlek</th>
                      <td>{percentage(asset.fund.getDividendLeak())}</td>
                    </tr>
                    <tr>
                      <th>Documenten</th>
                      <td>
                        {#if asset.fund.getFactsheet()}
                          <a href={asset.fund.getFactsheet()} target="_blank"
                            >Factsheet</a
                          >
                        {/if}

                        {#if asset.fund.getKiid()}
                          <a href={asset.fund.getKiid()} target="_blank"
                            ><abbr title="Essentiële beleggersinformatie"
                              >EBI</abbr
                            ></a
                          >
                        {/if}
                      </td>
                    </tr>
                  </tbody>
                </table>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <ul class="list-group list-group-flush">
        {#each simulations as simulation, key (simulation.getBroker().name)}
          {@const broker = simulation.getBroker()}

          <li class="list-group-item">
            <div class="row align-items-center">
              <div class="col-sm mb-2 mb-md-0">
                <div class="float-start float-sm-none float-md-start">
                  <img
                    src={`/images/${broker.logo}`}
                    width="80"
                    height="32"
                    alt={broker.name}
                    class="me-3 object-fit-contain"
                    {loading}
                  />
                </div>

                <div>
                  {#if broker.product}<span class=""
                      >{broker.product}<br /></span
                    >{/if}
                  <a
                    class="small"
                    href="#p{index}{key}"
                    data-bs-toggle="collapse">details</a
                  >
                </div>
              </div>

              <div class="col-6 col-sm-3 col-md-2 text-end d-none d-md-block">
                <div class="small">Geschatte kosten</div>
                <div>
                  <Decimals amount={money(simulation.getTotalCosts())} />
                </div>
              </div>

              <div class="col-6 col-sm-4 col-md-2 text-md-end">
                <div class="small">Verwacht rendement</div>
                <div>
                  <Decimals amount={money(simulation.getNetProfit())} />
                </div>
              </div>

              <div class="col-6 col-sm-4 col-md-3 text-end align-middle">
                {#if broker.affiliateLink}
                  <a
                    class="btn btn-sm btn-primary"
                    href={broker.affiliateLink}
                    target="_blank">Open een rekening</a
                  >
                {:else if broker.website}
                  <a
                    class="btn btn-sm btn-link text-muted"
                    href={broker.website}
                    target="_blank">Bezoek de website</a
                  >
                {/if}
              </div>
            </div>

            <div class="collapse" id="p{index}{key}">
              <div class="row">
                <div class="col-md">
                  <div class="card my-2">
                    <div class="card-body">
                      <table class="table small mb-0">
                        {#if broker.costOverview}
                          <caption class="mb-0">
                            (<a href={broker.costOverview} target="_blank"
                              >bron</a
                            >)
                          </caption>
                        {/if}
                        <tbody class="border-top-0">
                          <tr>
                            <th colspan="2">Tarieven</th>
                          </tr>
                          {#if broker.serviceFee.getExtendedDescription().length}
                            <tr>
                              <td>
                                Servicekosten per
                                {broker.serviceFeeFrequency == 'monthly'
                                  ? 'maand'
                                  : 'kwartaal'}
                              </td>
                              <td>
                                {#each broker.serviceFee.getExtendedDescription() as description, index}
                                  {description}
                                  {#if index !== broker.serviceFee.getExtendedDescription().length - 1}
                                    <br />
                                  {/if}
                                {/each}
                              </td>
                            </tr>
                          {/if}
                          <tr>
                            <td class="w-50">Transactiekosten</td>
                            <td>
                              Indexfondsen:
                              {broker.mutualFundTransactionFee.describe()}<br />
                              ETF's: {broker.etfTransactionFee.describe()}
                            </td>
                          </tr>
                          {#if broker.dividendDistributionFee.describe() !== 'geen'}
                            <tr>
                              <td>Kosten dividenduitkering</td>
                              <td>
                                {broker.dividendDistributionFee.describe()}
                              </td>
                            </tr>
                          {/if}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div class="col-md">
                  <div class="card my-2">
                    <div class="card-body">
                      <table class="table small mb-0">
                        <thead>
                          <tr>
                            <th colspan="2">Kosten</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="w-50">Lopende fondskosten</td>
                            <td class="text-end">
                              {money(
                                simulation.getPortfolio().getTotalRunningCosts()
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Dividendlekkage</td>
                            <td class="text-end">
                              {money(
                                simulation
                                  .getPortfolio()
                                  .getTotalDividendLeakage()
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Transactiekosten</td>
                            <td class="text-end">
                              {money(simulation.totalTransactionFees)}
                            </td>
                          </tr>
                          <tr>
                            <td>Servicekosten</td>
                            <td class="text-end">
                              {money(simulation.totalServiceFees)}
                            </td>
                          </tr>
                          <tr>
                            <td>Kosten dividenduitkering</td>
                            <td class="text-end">
                              {money(simulation.totalDividendDistributionFees)}
                            </td>
                          </tr>
                          <tr>
                            <td class="fw-bold">Totale kosten</td>
                            <td class="fw-bold text-end">
                              {money(simulation.getTotalCosts())}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
