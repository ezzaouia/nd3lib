/**
 * @author: @Med'eZ
 */

// A bit of imports
// const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('config');

const helpers = require('../../utils/helpers');

// webpack config
module.exports = {
  entry: {
    'vendors': config.get('app.vendors_file'),
    'main': config.get('app.main_file'),
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [helpers.root(config.get('app.src_folder')), helpers.root('node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ng-annotate-loader', 'awesome-typescript-loader'],
      },
      {
        test: /\.js$/,
        use: ['ng-annotate-loader', 'babel-loader'],
        exclude: [helpers.root('node_modules')],
      },
      {
        test: /\.html$/,
        use: ['raw-loader'],
        exclude: [helpers.root(config.get('app.template'))],
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: config.get('app.title'),
      template: config.get('app.template'),
    }),
  ],
  performance: {
    hints: 'warning',
    maxAssetSize: 10000000,
    maxEntrypointSize: 10000000,
  },
};
