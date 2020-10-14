<?php

declare(strict_types=1);

namespace NicWortel\IndexFundComparison\Import;

use Symfony\Component\Process\Process;

final class Pdftotext
{
    public function getText(string $pdfData): string
    {
        $process = new Process(['pdftotext', '-', '-']);
        $process->setInput($pdfData);

        $process->run();

        return $process->getOutput();
    }
}
