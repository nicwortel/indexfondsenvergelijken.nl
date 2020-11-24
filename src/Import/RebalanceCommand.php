<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

final class RebalanceCommand extends Command
{
    protected static $defaultName = 'rebalance';

    private Filesystem $filesystem;

    public function __construct(Filesystem $filesystem)
    {
        parent::__construct();

        $this->filesystem = $filesystem;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $data = $this->readJsonFile(__DIR__ . '/../../data/combinations.json');

        $combinations = array_map(
            function (array $data) {
                $data['portfolio'] = $this->rebalance($data['portfolio']);

                return $data;
            },
            $data
        );

        $json = json_encode($combinations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $this->filesystem->dumpFile(__DIR__ . '/../../data/combinations.json', $json . PHP_EOL);

        return 0;
    }

    private function rebalance(array $portfolio): array
    {
        $indices = $this->readJsonFile(__DIR__ . '/../../data/indices.json');

        $indices = array_combine(array_column($indices, 'name'), $indices);

        $funds = array_map(
            function (array $data) use ($indices): array {
                $fund = $this->getFundData($data['fund']);

                $exclusions = 0;

                if (isset($fund['esgExclusions'])) {
                    $exclusions = $fund['esgExclusions'] / 100;
                }

                $marketCap = $indices[$fund['index']]['marketCapitalization'] * (1 - $exclusions);

                return array_merge($data, ['marketCap' => $marketCap]);
            },
            $portfolio
        );

        $totalMarketCap = array_reduce(
            $funds,
            function (float $carry, array $fund): float {
                return $carry + $fund['marketCap'];
            },
            (float) 0
        );

        return array_map(
            function (array $asset) use ($totalMarketCap): array {
                $asset['allocation'] = round($asset['marketCap'] * 100 / $totalMarketCap);
                unset($asset['marketCap']);

                return $asset;
            },
            $funds
        );
    }

    private function getFundData(string $fundName): array
    {
        $funds = $this->readJsonFile(__DIR__ . '/../../data/funds.json');

        $matching = array_values(
            array_filter(
                $funds,
                function (array $fund) use ($fundName): bool {
                    return $fund['symbol'] === $fundName;
                }
            )
        );

        return $matching[0];
    }

    private function readJsonFile(string $path): array
    {
        $content = file_get_contents($path);

        return json_decode($content, true);
    }
}
