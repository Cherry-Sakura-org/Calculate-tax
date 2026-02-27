import { defineConfig } from '@rspack/cli';
import { rspack, type SwcLoaderOptions } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import fs from 'node:fs';
import path from 'node:path';

const isDev = process.env.NODE_ENV === 'development';

const readEnvFile = (filePath: string): Record<string, string> => {
    if (!fs.existsSync(filePath)) {
        return {};
    }

    return fs
        .readFileSync(filePath, 'utf-8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .reduce<Record<string, string>>((acc, line) => {
            const separatorIndex = line.indexOf('=');
            if (separatorIndex <= 0) {
                return acc;
            }
            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();
            acc[key] = value;
            return acc;
        }, {});
};

const envFromFile = readEnvFile(path.resolve(process.cwd(), '.env'));
const backendUrl = process.env.VITE_API_URL || envFromFile.VITE_API_URL || 'http://localhost:8080';
const apiBaseUrl = isDev ? '' : backendUrl;

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 versions', '> 0.2%', 'not dead', 'Firefox ESR'];

export default defineConfig({
    devServer: {
        port: 5173,
        historyApiFallback: true,
        proxy: [
            {
                context: ['/auth', '/orders', '/users', '/oauth2', '/login/oauth2', '/csrf', '/swagger-ui', '/v3'],
                target: backendUrl,
                changeOrigin: true,
            },
        ],
    },
    entry: {
        main: './src/main.tsx',
    },
    resolve: {
        extensions: ['...', '.ts', '.tsx', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.svg$/,
                type: 'asset',
            },
            {
                test: /\.(jsx?|tsx?)$/,
                use: [
                    {
                        loader: 'builtin:swc-loader',
                        options: {
                            jsc: {
                                parser: {
                                    syntax: 'typescript',
                                    tsx: true,
                                },
                                transform: {
                                    react: {
                                        runtime: 'automatic',
                                        development: isDev,
                                        refresh: isDev,
                                    },
                                },
                            },
                            env: { targets },
                        } satisfies SwcLoaderOptions,
                    },
                ],
            },
        ],
    },
    plugins: [
        new rspack.DefinePlugin({
            __API_BASE__: JSON.stringify(apiBaseUrl),
        }),
        new rspack.HtmlRspackPlugin({
            template: './index.html',
        }),
        isDev ? new ReactRefreshRspackPlugin() : null,
    ],
    optimization: {
        minimizer: [
            new rspack.SwcJsMinimizerRspackPlugin(),
            new rspack.LightningCssMinimizerRspackPlugin({
                minimizerOptions: { targets },
            }),
        ],
    },
    experiments: {
        css: true,
    },
});
