const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            }
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
        new FaviconsWebpackPlugin('./node_modules/bootstrap-icons/icons/graph-up.svg'),
        new CopyPlugin({
            patterns: [
                {from: 'assets/main.css', to: ''},
                {from: 'node_modules/bootstrap/dist/css/bootstrap.min.css', to: ''},
                {from: 'node_modules/bootstrap-icons/icons/question-circle.svg', to: 'icons/'},
                {from: 'node_modules/bootstrap-icons/icons/info-circle.svg', to: 'icons/'},
            ],
        }),
    ],
};
