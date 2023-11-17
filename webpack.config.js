const path =  require('path');
const CopyPlugin = require("copy-webpack-plugin");

// This is main configuration object that tells Webpackw what to do. 
module.exports = {
  //path to entry paint
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'src/app/'),
      infra: path.resolve(__dirname, 'src/infra/'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  // watch: true,
  devServer: {
    port: 8000,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "index.html") },
        { from: path.resolve(__dirname, "src/books"), to: "books" },
        { from: path.resolve(__dirname, "src/infra/view/style"), to: "style" },
      ],
    }),
  ],
  mode: 'development'
}
