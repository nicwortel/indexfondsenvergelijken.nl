<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

interface IndexFactsheetParser
{
    public function supports(string $url): bool;

    public function parse(string $url, string $content): Index;
}
