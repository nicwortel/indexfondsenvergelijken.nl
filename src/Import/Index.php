<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

final class Index
{
    public string $name;

    public string $markets;

    public array $sizes = [];

    public float $marketCapitalization;

    public float $percentageOfTotalMarketCapitalization;

    public string $factsheet;

    public function __construct(
        string $name,
        string $markets,
        array $sizes,
        float $marketCapitalization,
        string $factsheet
    ) {
        $this->name = $name;
        $this->marketCapitalization = $marketCapitalization;
        $this->factsheet = $factsheet;
        $this->sizes = $sizes;
        $this->markets = $markets;
    }
}
