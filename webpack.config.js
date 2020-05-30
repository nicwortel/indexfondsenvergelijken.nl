const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'node_modules/bootstrap/dist/css/bootstrap.min.css', to: '' },
                { from: 'node_modules/bootstrap-icons/icons/question-circle.svg', to: 'icons/' },
                { from: 'node_modules/bootstrap-icons/icons/info-circle.svg', to: 'icons/' },
            ],
        }),
    ],
};
