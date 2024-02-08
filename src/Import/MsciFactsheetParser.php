<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use NumberFormatter;
use Smalot\PdfParser\Document;
use Smalot\PdfParser\Parser;

final class MsciFactsheetParser implements IndexFactsheetParser
{
    private Parser $pdfParser;

    private NumberFormatter $numberParser;

    public function __construct(Parser $pdfParser)
    {
        $this->pdfParser = $pdfParser;
        $this->numberParser = new NumberFormatter('en-US', NumberFormatter::DECIMAL);
    }

    public function supports(string $url): bool
    {
        return str_contains($url, 'msci.com');
    }

    public function parse(string $url, string $content): Index
    {
        // Fix broken PDF with %%EO instead of %%EOF
        $content = preg_replace('/%%EO$/', '%%EOF', $content);
        $document = $this->pdfParser->parseContent($content);

        $name = $document->getDetails()['Title'];
        $companySizes = $this->getCompanySizes($document);
        $markets = $this->getMarkets($document);
        $marketCap = $this->getMarketCapitalization($document);

        return new Index($name, $markets, $companySizes, $marketCap, $url);
    }

    private function getMarkets(Document $document): string
    {
        $text = $this->getText($document);

        if (preg_match(
            '/representation across \d+ Developed ?Markets ?\(DM\) and.\d+ Emerging ?Markets ?\(EM\) countries/i',
            $text
        )) {
            return 'all-world';
        }

        if (preg_match('/representation across \d+ Developed ?Markets ?\(DM\) countries/i', $text)) {
            return 'developed';
        }

        if (preg_match('/representation across \d+ Emerging ?Markets ?\(EM\) countries/i', $text)) {
            return 'emerging';
        }

        return '';
    }

    private function getCompanySizes(Document $document): array
    {
        $text = $this->getText($document);

        $text = str_replace(' and ', ', ', $text);

        preg_match('/captures ((large|mid|small).*) cap representation/i', $text, $matches);

        return explode(', ', $matches[1]);
    }

    private function getMarketCapitalization(Document $document): float
    {
        $text = $document->getText();
        preg_match('/Index[\s]+([\d\.\,]+)/i', $text, $matches);

        return $this->numberParser->parse($matches[1]);
    }

    private function getText(Document $document): string
    {
        $text = $document->getPages()[0]->getTextArray();
        $text = implode('', $text);
        $text = str_replace(' ', ' ', $text);

        return $text;
    }
}
