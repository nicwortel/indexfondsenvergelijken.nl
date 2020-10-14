<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

interface DataImporter
{
    public function import(): void;
}
