const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.twig$/,
                use: 'twig-loader'
            },
            {
                test: /\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|webp|tiff?)/i,
                use: [
                    {
                        loader: "webpack-image-resize-loader",
                        options: {
                            width: 100,
                            height: 40,
                            fit: "contain",
                            background: "#fff",
                            format: "png",
                            quality: 100,
                            fileLoaderOptions: {
                                name: '[name].[ext]',
                                outputPath: 'images'
                            }
                        },
                    },
                ],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {
                            limit: 10000,
                        },
                    },
                ],
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'index.html',
            minify: false
        }),
        new HtmlWebpackPlugin({
            template: 'veelgestelde-vragen.html',
            filename: 'veelgestelde-vragen.html',
            minify: false
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),
        new FaviconsWebpackPlugin({
            logo: './node_modules/bootstrap-icons/icons/graph-up.svg',
            favicons: {
                appName: 'Indexfondsenvergelijken.nl',
                lang: 'nl-NL',
                background: "#fff"
            }
        }),
        new CopyPlugin({
            patterns: [
                {from: 'assets/robots.txt', to: ''},
            ],
        }),
    ],
};
