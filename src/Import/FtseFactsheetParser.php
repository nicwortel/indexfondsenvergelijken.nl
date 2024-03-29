<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use NumberFormatter;

final class FtseFactsheetParser implements IndexFactsheetParser
{
    private Pdftotext $pdftotext;

    private NumberFormatter $numberParser;

    public function __construct(Pdftotext $pdftotext)
    {
        $this->pdftotext = $pdftotext;
        $this->numberParser = new NumberFormatter('en-US', NumberFormatter::DECIMAL);
    }

    public function supports(string $url): bool
    {
        return str_contains($url, 'ftserussell.com');
    }

    public function parse(string $url, string $content): Index
    {
        $text = $this->pdftotext->getText($content);

        $name = $this->getName($text);
        $markets = $this->getMarkets($text);
        $sizes = $this->getSizes($text);

        return new Index($name, $markets, $sizes, $this->getMarketCap($text), $url);
    }

    private function getName(string $text): string
    {
        preg_match('/FTSE .* Index/i', $text, $matches);

        return $matches[0];
    }

    private function getMarkets(string $text): string
    {
        $text = str_replace(PHP_EOL, ' ', $text);

        if (str_contains($text, 'Developed and Emerging markets')) {
            return 'all-world';
        }

        if (str_contains($text, 'Developed markets')) {
            return 'developed';
        }

        if (str_contains($text, 'Emerging markets')) {
            return 'emerging';
        }

        return '';
    }

    private function getSizes(string $text): array
    {
        $text = str_replace(' and ', ', ', $text);

        preg_match('/performance of (?:the )?((large|mid|small).*) cap (stocks|companies)/i', $text, $matches);

        return explode(', ', $matches[1]);
    }

    private function getMarketCap(string $text): float
    {
        preg_match('/Net MCap \(USDm\)\s+([\d,]+)/im', $text, $matches);

        return $this->numberParser->parse($matches[1]);
    }
}
