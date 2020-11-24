#!/usr/bin/env php
<?php

declare(strict_types=1);

use NicWortel\IndexFundComparison\Import\FtseFactsheetParser;
use NicWortel\IndexFundComparison\Import\ImportCommand;
use NicWortel\IndexFundComparison\Import\IndexImporter;
use NicWortel\IndexFundComparison\Import\MsciFactsheetParser;
use NicWortel\IndexFundComparison\Import\Pdftotext;
use NicWortel\IndexFundComparison\Import\RebalanceCommand;
use Smalot\PdfParser\Parser;
use Symfony\Component\Console\Application;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpClient\CachingHttpClient;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpKernel\HttpCache\Store;

require_once __DIR__ . '/../vendor/autoload.php';

$application = new Application();

$httpClient = new CachingHttpClient(HttpClient::create(), new Store('var/cache'));
$filesystem = new Filesystem();
$pdfParser = new Parser();
$factsheetParsers = [
    new MsciFactsheetParser($pdfParser),
    new FtseFactsheetParser(new Pdftotext()),
];
$indexImporter = new IndexImporter($httpClient, $factsheetParsers, $filesystem);
$application->add(new ImportCommand($indexImporter));
$application->add(new RebalanceCommand($filesystem));

$application->run();
