const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { GenerateSW } = require("workbox-webpack-plugin")

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production"

  return {
    entry: "./scripts/main.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      clean: true,
      publicPath: "/",
    },
    mode: argv.mode || "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      port: 3000,
      host: 'localhost',
      hot: true,
      historyApiFallback: true,
      open: true,
      allowedHosts: 'all',
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              configFile: path.resolve(__dirname, "babel.config.cjs"),
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                sourceMap: !isProduction,
              },
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name].[hash][ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name].[hash][ext]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
        filename: "index.html",
        inject: "body",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "styles",
            to: "styles",
          },
          {
            from: "manifest.json",
            to: "manifest.json",
          },
          {
            from: "public/sw.js",
            to: "sw.js",
            noErrorOnMissing: true,
          },
          {
            from: "STUDENT.txt",
            to: "STUDENT.txt",
          },
          {
            from: "public/icons",
            to: "icons",
            noErrorOnMissing: true,
          },
        ],
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: "[name].[contenthash].css",
              chunkFilename: "[id].[contenthash].css",
            }),
            new GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/story-api\.dicoding\.dev\//,
                  handler: "NetworkFirst",
                  options: {
                    cacheName: "api-cache",
                    expiration: {
                      maxEntries: 50,
                      maxAgeSeconds: 5 * 60,
                    },
                  },
                },
                {
                  urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\//,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "map-tiles",
                    expiration: {
                      maxEntries: 200,
                      maxAgeSeconds: 30 * 24 * 60 * 60,
                    },
                  },
                },
                {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "images",
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 30 * 24 * 60 * 60,
                    },
                  },
                },
              ],
            }),
          ]
        : []),
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          leaflet: {
            test: /[\\/]node_modules[\\/]leaflet[\\/]/,
            name: "leaflet",
            chunks: "all",
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "scripts"),
        "@styles": path.resolve(__dirname, "styles"),
        "@public": path.resolve(__dirname, "public"),
      },
    },
  }
}
