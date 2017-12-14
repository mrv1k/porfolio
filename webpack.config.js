const merge = require('webpack-merge');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

const parts = require('./webpack.config.parts');


const commonConfig = merge([
  {
    entry: PATHS.app,
    output: {
      filename: 'bundle.js',
      path: PATHS.build,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'app/index.html',
      }),
    ],
  },
  parts.loadHtml(),
]);


const devConfig = merge([
  {
    devtool: 'inline-source-map',
  },
  parts.devServer(),
  parts.loadCSS(),
  parts.loadImages(),
]);


const prodConfig = merge([
  {
    devtool: 'source-map',
    performance: {
      hints: 'error',
    },
  },
  parts.clean(PATHS.build),
  parts.extractCSS({
    use: [
      'css-loader',
      parts.autoprefix(),
      parts.uncss({
        html: [path.join(PATHS.app, 'index.html')],
        ignore: [
          '.form-control.is-invalid',
          '.form-control.is-invalid ~ .invalid-feedback',
          '.form-control.is-invalid:focus',
        ],
      }),
    ],
  }),
  parts.optimizeImages(),
  parts.loadImages({
    options: {
      limit: 10 * 1024,
      name: '[name].[ext]',
      outputPath: 'images/',
    },
  }),
  parts.loadJS({ include: PATHS.app }),
  parts.uglifyJS({ sourceMap: true }),
]);


module.exports = (env) => {
  if (env === 'production') {
    return merge(commonConfig, prodConfig);
  }

  return merge(commonConfig, devConfig);
};
