const crypto = require('crypto');
const fs = require('fs');
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

const getCacheVersion = (mode) => {
    const hash = crypto.createHash('sha256');
    hash.update(`mode:${mode}`);

    // Track rspack.config.js
    try {
        hash.update(fs.readFileSync(__filename, 'utf8'));
    } catch {
        // ignore
    }

    // Track .env (ignore VERSION= so patch bumps don't invalidate cache,
    // while APP_ENV / APP_API / STATE changes DO invalidate cache)
    const envPath = path.resolve(__dirname, './.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs
            .readFileSync(envPath, 'utf8')
            .replace(/^VERSION=.*$/gm, '');
        hash.update(envContent);
    }

    // Track package-lock.json (captures @amec/webasset git commit & dep updates)
    const lockPath = path.resolve(__dirname, './package-lock.json');
    if (fs.existsSync(lockPath)) {
        hash.update(fs.readFileSync(lockPath));
    }

    return hash.digest('hex').slice(0, 16);
};

module.exports = (_env, argv = {}) => {
    const mode = argv.mode || process.env.STATE || 'development';
    const isProd = mode === 'production';
    const usePersistentCache = process.env.RSPACK_CACHE === 'true';

    const config = {
        entry: getEntries(),
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'assets/dist/js'),
            clean: true,
        },
        mode,
        devtool: isProd ? false : 'source-map',
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
            minimize: isProd,
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

    if (usePersistentCache) {
        config.cache = true;
        config.experiments = {
            cache: {
                type: 'persistent',
                version: getCacheVersion(mode),
                buildDependencies: [__filename],
            },
        };
    }

    return config;
};
