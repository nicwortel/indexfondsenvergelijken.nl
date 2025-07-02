<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class IndexImporter implements DataImporter
{
    private const ALL_WORLD_FACTSHEET = 'https://www.msci.com/documents/10199/4211cc4b-453d-4b0a-a6a7-51d36472a703';

    // private const ALL_WORLD_FACTSHEET = 'https://research.ftserussell.com/Analytics/Factsheets/Home/DownloadSingleIssue?issueName=GEISLMS&IsManual=false';

    private const FACTSHEETS = [
        'MSCI USA' => 'https://www.msci.com/documents/10199/255599/msci-usa-index-gross.pdf',
        'MSCI World ex USA' => 'https://www.msci.com/documents/10199/cd91b9d8-e765-4b04-9edf-c45c6c7d971d',
        'MSCI ACWI IMI Index' => 'https://www.msci.com/documents/10199/4211cc4b-453d-4b0a-a6a7-51d36472a703',
        'MSCI World Index' => 'https://www.msci.com/documents/10199/4db922ce-68d2-446d-2f9e-4ed408a9db29',
        'MSCI World Small Cap Index' => 'https://www.msci.com/documents/10199/a67b0d43-0289-4bce-8499-0c102eaa8399',
        'MSCI Emerging Markets Index' => 'https://www.msci.com/documents/10199/c0db0a48-01f2-4ba9-ad01-226fd5678111',
        'MSCI Emerging Markets IMI Index' => 'https://www.msci.com/documents/10199/97e25eb7-9bd0-4204-bea9-077095acf1d3',
        'FTSE All-World Index' => 'https://research.ftserussell.com/Analytics/Factsheets/Home/DownloadSingleIssue?issueName=AWORLDS&IsManual=false',
        'FTSE Developed Index' => 'https://research.ftserussell.com/Analytics/FactSheets/Home/DownloadSingleIssue?issueName=AWD&IsManual=False',
    ];

    private const CUSTOM_ESG_INDICES = [
        'MSCI World Custom ESG Index' => 'MSCI World Index',
        'MSCI Emerging Markets Custom ESG Index' => 'MSCI Emerging Markets Index',
        'MSCI World Small Cap Custom ESG Low Carbon Index' => 'MSCI World Small Cap Index',
    ];

    private HttpClientInterface $httpClient;

    /**
     * @var IndexFactsheetParser[]
     */
    private array $parsers;

    private Filesystem $filesystem;

    private MeesmanIndexFactory $meesmanIndexFactory;

    public function __construct(
        HttpClientInterface $httpClient,
        array $parsers,
        Filesystem $filesystem
    ) {
        $this->parsers = $parsers;
        $this->filesystem = $filesystem;
        $this->httpClient = $httpClient;
        $this->meesmanIndexFactory = new MeesmanIndexFactory();
    }

    public function import(): void
    {
        $allWorldIndex = $this->importUrl(self::ALL_WORLD_FACTSHEET);

        $indices = array_map(
            function (string $url) use ($allWorldIndex): Index {
                $index = $this->importUrl($url);
                $index->percentageOfTotalMarketCapitalization = $this->getMarketCapPercentage(
                    $index->marketCapitalization,
                    $allWorldIndex->marketCapitalization
                );

                return $index;
            },
            self::FACTSHEETS
        );

        $customEsgIndices = $this->getCustomEsgIndices($indices);

        $meesmanIndex = $this->meesmanIndexFactory->getIndex($customEsgIndices, $allWorldIndex);

        $indices = array_values(array_merge($indices, $customEsgIndices, [$meesmanIndex]));

        $json = json_encode($indices, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $this->filesystem->dumpFile(__DIR__ . '/../../data/indices.json', $json . PHP_EOL);
    }

    private function importUrl(string $url): Index
    {
        $content = $this->httpClient->request('GET', $url)->getContent();

        $parser = $this->getParserFor($url);

        return $parser->parse($url, $content);
    }

    private function getParserFor(string $url): IndexFactsheetParser
    {
        foreach ($this->parsers as $parser) {
            if ($parser->supports($url)) {
                return $parser;
            }
        }
    }

    /**
     * @param Index[] $indices
     *
     * @return Index[]
     */
    private function getCustomEsgIndices(array $indices): array
    {
        $customEsgIndices = array_map(
            function (string $name, string $baseIndexName) use ($indices): Index {
                $baseIndex = $indices[$baseIndexName];

                $index = new Index($name, $baseIndex->markets, $baseIndex->sizes, $baseIndex->marketCapitalization, '');
                $index->percentageOfTotalMarketCapitalization = $baseIndex->percentageOfTotalMarketCapitalization;

                return $index;
            },
            array_keys(self::CUSTOM_ESG_INDICES),
            self::CUSTOM_ESG_INDICES
        );

        return array_combine(array_keys(self::CUSTOM_ESG_INDICES), $customEsgIndices);
    }

    private function getMarketCapPercentage(float $marketCap, float $allWorldMarketCap): float
    {
        return ($marketCap / $allWorldMarketCap) * 100;
    }
}
