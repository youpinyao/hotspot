const path = require('path');
// eslint-disable-next-line
const webpack = require('webpack');
// eslint-disable-next-line
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  port: '8080',
  host: '0.0.0.0',
  publicPath: '/',
  path: 'dist',
  vendors: false,
  hash: false,
  entrys: [{
    name: 'hotspot.min',
    entry: './index.js',
  }],
  cssOptions: {
    modules: false,
  },
  lessOptions: undefined,
  sassOptions: undefined,
  extraBabelPresets: [],
  extraBabelPlugins: [],
  webpackMerge: {
    resolve: {
      alias: {

      },
    },
    plugins: [
      // new webpack.ProvidePlugin({
      //   $: 'jquery',
      // }),
      // new webpack.ProvidePlugin({
      //   moment: 'moment',
      // }),
    ],
  },
  afterBuild() {
    console.log('afterBuild');
  },
  // 对应环境独立的配置
  development: {},
  // 对应环境独立的配置
  production: {},
  // 如果某些的特定的依赖需要同项目一样构建，正则表达式
  buildInclude: undefined,
};
