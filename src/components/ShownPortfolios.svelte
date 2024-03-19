<script lang="ts">
  import { portfoliosStore } from './simulations';

  $: totalPortfolios = $portfoliosStore.portfolios.length;
  $: shownPortfolios = $portfoliosStore.filteredPortfolios.length;
</script>

<p class="small">
  Met de huidige filters worden <span id="shownPortfolios"
    >{shownPortfolios}</span
  >
  van de <span id="totalPortfolios">{totalPortfolios}</span> portfolio's getoond.
</p>
