<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use function array_map;

final class MeesmanIndexFactory
{
    private const WORLD_INDEX = 'MSCI World Custom ESG Index';

    private const EM_INDEX = 'MSCI Emerging Markets Custom ESG Index';

    private const SMALL_CAP_INDEX = 'MSCI World Small Cap Custom ESG Low Carbon Index';

    /**
     * ESG exclusion percentages are coming from the Northern Trust fund factsheets.
     * The values can be found in each factsheet as the "% van marktkapitalisatie" under "ESG-uitsluitingen".
     *
     * @see https://cdn.northerntrust.com/pws/nt/documents/funds/intl/factsheets/northern-trust-world-custom-esg-equity-index-ucits-fgr-feeder-fund-nlfw-sha-eur-re-nl.pdf
     *      https://cdn.northerntrust.com/pws/nt/documents/funds/intl/factsheets/northern-trust-emerging-markets-custom-esg-equity-index-ucits-fgr-fund-nleme-sha-eur-re-nl.pdf
     *      https://cdn.northerntrust.com/pws/nt/documents/funds/intl/factsheets/northern-trust-world-small-cap-esg-low-carbon-fgr-feeder-fund-nlfsc-sha-eur-re-nl-noperf.pdf
     *
     * @TODO: Fetch these values from data/funds.json
     */
    private const ESG_EXCLUSION_PERCENTAGES = [
        self::WORLD_INDEX => 4.3,
        self::EM_INDEX => 5.6,
        self::SMALL_CAP_INDEX => 17.7,
    ];

    /**
     * Meesman Indexfonds Aandelen Wereldwijd Totaal invests in a market cap weighted mix of three funds by Northern Trust:
     * - Northern Trust World Custom ESG Equity Index Fund
     * - Northern Trust Emerging Markets Custom ESG Equity Index UCITS FGR Fund
     * - Northern Trust World Small Cap ESG Low Carbon Index FGR Fund
     *
     * As this is not really supported by the website, we create a virtual index that takes the characteristics of the
     * three underlying indices into account.
     *
     * @param Index[] $indices
     */
    public function getIndex(array $indices, Index $allWorldIndex): Index
    {
        $underlyingIndices = [
            $indices[self::WORLD_INDEX],
            $indices[self::EM_INDEX],
            $indices[self::SMALL_CAP_INDEX],
        ];

        // Calculate the market capitalization of each index, subtracting ESG exclusions.
        $adjustedMarketCaps = array_map(
            function (Index $index): float {
                $includedPercentage = 100 - self::ESG_EXCLUSION_PERCENTAGES[$index->name];

                return $index->marketCapitalization * ($includedPercentage / 100);
            },
            $underlyingIndices
        );

        // Calculate the combined market capitalization of the three indices.
        $combinedMarketCapitalization = array_sum($adjustedMarketCaps);
        $combinedMarketCapitalization = round($combinedMarketCapitalization, 2);

        $marketCapPercentage = ($combinedMarketCapitalization / $allWorldIndex->marketCapitalization) * 100;

        $index = new Index(
            'Mix van 3 MSCI Custom ESG indexen',
            'all-world',
            ['large', 'mid', 'small'],
            $combinedMarketCapitalization,
            ''
        );
        $index->percentageOfTotalMarketCapitalization = $marketCapPercentage;

        return $index;
    }
}
