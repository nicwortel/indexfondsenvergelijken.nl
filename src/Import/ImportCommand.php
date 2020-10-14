<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

final class ImportCommand extends Command
{
    protected static $defaultName = 'import';

    private IndexImporter $indexImporter;

    public function __construct(IndexImporter $indexImporter)
    {
        parent::__construct();
        $this->indexImporter = $indexImporter;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->indexImporter->import();

        return 0;
    }
}
