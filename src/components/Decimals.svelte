<script lang="ts">
  export let amount: string;

  $: parts = amount.split(',');
  $: decimals = parts[1];
</script>

{#if decimals}
  {parts[0]},<span class="decimals">{decimals}</span>
{:else}
  {amount}
{/if}
