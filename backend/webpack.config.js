const path = require("path");
const BrotliPlugin = require('brotli-webpack-plugin');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: 'production',
    entry: {
        main: "./src"
    },
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "[name].bundle.js",
    },
    module: {
        rules: [
            {test: /\.css$/,
                use: [MiniCssExtractPlugin.loader,"css-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/index.html"}),
        new MiniCssExtractPlugin({filename: "[name].css"}),
        new BrotliPlugin({
            asset: '[file].br',
            test: /\.(js)$/
        })
    ]
}