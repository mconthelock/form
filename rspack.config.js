const path = require('path');
const rspack = require('@rspack/core');
const Dotenv = require('dotenv-webpack');
const { sync } = require('glob');
const { defaultConfig } = require('@amec/webasset/default.config');

require('dotenv').config({
    path: path.resolve(__dirname, './.env'),
});

const getEntries = () => {
    const baseEntries = {
        apps: './assets/script/apps.js',
    };
    const configFiles = sync('./assets/script/**/entry.js');
    const moduleEntries = configFiles.reduce((acc, file) => {
        const moduleConfig = require(path.resolve(__dirname, file));
        return { ...acc, ...moduleConfig };
    }, {});
    return { ...baseEntries, ...moduleEntries };
};

module.exports = {
    entry: getEntries(),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'assets/dist/js'),
        clean: true,
    },
    mode: process.env.STATE || 'development',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                type: 'javascript/auto',
            },
            {
                test: /\.md$/,
                type: 'asset/source',
            },
        ],
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new Dotenv(),
        new rspack.DefinePlugin({
            __WEBASSET_CONFIG__: JSON.stringify(defaultConfig({})),
        }),
        new rspack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            datatables: 'DataTables',
        }),
        new rspack.CopyRspackPlugin({
            patterns: [
                {
                    from: path.resolve(
                        __dirname,
                        'node_modules/@amec/webasset/src/fonts',
                    ),
                    to: path.resolve(__dirname, 'assets/fonts'),
                    noErrorOnMissing: true,
                },
                {
                    from: path.resolve(
                        __dirname,
                        'node_modules/@amec/webasset/src/images',
                    ),
                    to: path.resolve(__dirname, 'assets/images'),
                    noErrorOnMissing: true,
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            jquery: require.resolve('jquery'),
        },
    },
};
