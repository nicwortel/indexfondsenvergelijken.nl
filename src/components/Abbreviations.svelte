<script lang="ts">
  import { beforeUpdate } from 'svelte';

  export let name: string;

  const abbreviations: Record<string, string> = {
    EM: 'Emerging Markets',
    ESG: 'Environmental, Social & Governance',
    ETF: 'Exchange-traded Fund',
    FGR: 'Fonds voor Gemene Rekening',
    FTSE: 'Financial Times Stock Exchange',
    MSCI: 'Morgan Stanley Capital International',
    IMI: 'Investable Market Index',
    UCITS: 'Undertakings for Collective Investment in Transferable Securities',
  };

  let replacedName: string;

  beforeUpdate(() => {
    replacedName = name;

    for (const abbreviation in abbreviations) {
      replacedName = replacedName.replace(
        abbreviation,
        `<abbr title="${abbreviations[abbreviation]}">${abbreviation}</abbr>`
      );
    }
  });
</script>

{@html replacedName}
