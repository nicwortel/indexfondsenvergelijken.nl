<script lang="ts">
  import { formStore, portfoliosStore, numberFormatter } from './simulations';

  let differentInitialInvestment = $formStore.differentInitialInvestment;
  let monthly = $formStore.monthly;
  let years = $formStore.years;
  let initial = $formStore.initial;
  let returnPercentage = $formStore.returnPercentage;
  let dividendYield = $formStore.dividendYield;
  let minimumMarketCap = $formStore.minimumMarketCap;

  let form: HTMLFormElement;

  const handleForm = () => {
    if (form.checkValidity()) {
      formStore.set({
        differentInitialInvestment,
        monthly,
        years,
        initial,
        returnPercentage,
        dividendYield,
        minimumMarketCap,
      });
    }
  };

  $: totalInvestment = $portfoliosStore.totalInvestment;
  $: yearsOutput = $formStore.years;
</script>

<form id="form" class="was-validated" bind:this={form} on:change={handleForm}>
  <div class="row mb-2">
    <div class="col col-lg-12 col-xl">
      <label for="monthly">Maandelijkse inleg</label>
      <div class="input-group">
        <span class="input-group-text">€</span>
        <input
          type="number"
          class="form-control rounded-end"
          id="monthly"
          bind:value={monthly}
          min="0"
          inputmode="numeric"
          pattern="[0-9]*"
        />
        <div class="invalid-feedback">
          De maandelijkse inleg mag niet negatief zijn.
        </div>
      </div>
    </div>

    <div class="col col-lg-12 col-xl">
      <label for="years">Looptijd</label>
      <div class="input-group">
        <input
          type="number"
          class="form-control"
          id="years"
          min="1"
          max="100"
          bind:value={years}
          inputmode="numeric"
          pattern="[0-9]*"
        />
        <span class="input-group-text">jaar</span>
      </div>
    </div>
  </div>
  <div class="mb-2">
    <div class="form-check mb-2">
      <label for="initial">
        <input
          class="form-check-input"
          type="checkbox"
          id="differentInitialInvestment"
          bind:checked={differentInitialInvestment}
        />
        <label class="pl-1" for="differentInitialInvestment"
          >Afwijkende inleg eerste maand</label
        >
      </label>
    </div>

    <div class="input-group">
      <span class="input-group-text">€</span>
      <input
        type="number"
        class="form-control rounded-end"
        id="initial"
        bind:value={initial}
        min="1"
        inputmode="numeric"
        pattern="[0-9]*"
        disabled={!differentInitialInvestment}
      />
      <div class="invalid-feedback">
        De eerste inleg moet minimaal € 1 bedragen.
      </div>
    </div>
  </div>

  <p>
    Totaal ingelegd na <span class="years">{yearsOutput}</span> jaar:
    <span id="totalInvestment"
      >{numberFormatter.formatMoney(totalInvestment)}</span
    >.
  </p>

  <div class="row mb-2">
    <div class="col col-lg-12 col-xl">
      <label for="return">Groei</label>
      <div class="input-group">
        <input
          type="number"
          class="form-control"
          id="return"
          bind:value={returnPercentage}
          step="0.5"
          inputmode="decimal"
          pattern="[0-9]*"
        />
        <span class="input-group-text">%</span>
      </div>
    </div>
    <div class="col col-lg-12 col-xl">
      <label for="dividendYield">Dividend</label>
      <div class="input-group">
        <input
          type="number"
          class="form-control"
          id="dividendYield"
          bind:value={dividendYield}
          step="0.5"
          min="0"
          inputmode="decimal"
        />
        <span class="input-group-text">%</span>
      </div>
    </div>
  </div>

  <h3>Filter resultaten</h3>

  <div class="mb-2">
    <label for="minimumMarketCap">Minimum marktkapitalisatie</label>
    <div class="input-group">
      <input
        type="number"
        class="form-control"
        min="0"
        max="100"
        id="minimumMarketCap"
        bind:value={minimumMarketCap}
        step="1"
        inputmode="decimal"
      />
      <span class="input-group-text">%</span>
    </div>
  </div>
</form>
