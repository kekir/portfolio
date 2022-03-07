const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin')

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyserPlugin

const paths = require('./paths')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: {
    // util: paths.src + '/js/util.js',
    // scripts: paths.src + '/js/scripts.js',
    index: paths.src + '/views/index.js',
    about: paths.src + '/views/about.js',
    services: paths.src + '/views/services.js',
    portfolio: paths.src + '/views/portfolio.js',
    contact: paths.src + '/views/contact.js',
  },

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    // filename: '[name].[contenthash].js',
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.src + '/assets/img',
          to: 'img',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: 'My Home',
      favicon: paths.src + '/assets/img/favicon.png',
      template: paths.src + '/views/index.html', // template file
      inject: true,
      chunks: ['index'],
      filename: 'index.html', // output file
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new HtmlWebpackPlugin({
      title: 'About me',
      favicon: paths.src + '/assets/img/favicon.png',
      template: paths.src + '/views/about.html', // template file
      inject: true,
      chunks: ['about'],
      filename: 'about.html', // output file
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new HtmlWebpackPlugin({
      title: 'Services',
      favicon: paths.src + '/assets/img/favicon.png',
      template: paths.src + '/views/services.html', // template file
      inject: true,
      chunks: ['services'],
      filename: 'services.html', // output file
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new HtmlWebpackPlugin({
      title: 'portfolio',
      favicon: paths.src + '/assets/img/favicon.png',
      template: paths.src + '/views/portfolio.html', // template file
      inject: true,
      chunks: ['portfolio'],
      filename: 'portfolio.html', // output file
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new HtmlWebpackPlugin({
      title: 'contact',
      favicon: paths.src + '/assets/img/favicon.png',
      template: paths.src + '/views/contact.html', // template file
      inject: true,
      chunks: ['contact'],
      filename: 'contact.html', // output file
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    // new HtmlWebpackPartialsPlugin({
    //   path: paths.src + '/partials/header.html',
    //   location: 'header',
    //   template_filename: ['index.html'],
    // }),

    new MergeIntoSingleFilePlugin({
      // 👈  merge util.js and components .js files
      files: {
        'frontend.js': [
          paths.src + '/assets/js/util.js',
          paths.src + '/assets/js/components/**/*.js',
          paths.src + '/js/scripts.js',
        ],
      },
    }),

    // new BundleAnalyzerPlugin({ generateStatsFile: true }),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      {
        test: /\.m?js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },

      // Images: Copy image files to build folder
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },

      {
        // https://webpack.js.org/guides/asset-modules/#replacing-inline-loader-syntax
        resourceQuery: /raw/,
        type: 'asset/source',
      },

      {
        // https://webpack.js.org/loaders/html-loader/#usage
        test: /\.html$/,
        resourceQuery: /template/,
        loader: 'html-loader',
      },
    ],
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      assets: paths.public,
    },
  },
}
