const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

//хранит значение, находимся ли мы в режиме разработки
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if(isProd) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
}

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            },
            
        },
        'css-loader',
        'sass-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const opts = {
        'presets': [
            [
                "@babel/preset-env",

            ]
        ],
        'plugins': [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if(preset) {
        opts.presets.push(preset)
    }

    return opts
    
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }]

    if (isDev) {
        loaders.push('eslint-loader')
    }
    return loaders
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    //точка входа в нашем приложении (откуда стоит начать)
    entry: {
        main: ['@babel/polyfill','./index.jsx'],
        analytics: './analytics.js'
    },
    output: {
        //Когда webpack соберет все наши скрипты, мы получим 1 файл bundle.js
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        //расширения которые можно не писать
        extensions:['.js', '.png', '.json'],
        //пути
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    devtool: isDev ? 'source-map': '',
    devServer: {
        port: 4200,
        hot: isDev
    },
    optimization: optimization(),
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/icon.png'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                //webpack идет справа налево 
                use: cssLoaders()
            },

            {
                test: /\.s[ac]ss$/, 
                use: cssLoaders('sass-loader')
            },

            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader']
            },

            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },

            {   test: /\.js$/,
                //пропустить при обработке, не нужно компилировать 
                exclude: /node_modules/,
                use: jsLoaders() 
            },

            {   test: /\.ts$/,
                //пропустить при обработке, не нужно компилировать 
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                } 
            },

            {   test: /\.jsx$/,
                //пропустить при обработке, не нужно компилировать 
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                } 
            }
        ]

        
    }
}