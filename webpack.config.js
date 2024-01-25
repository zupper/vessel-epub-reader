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
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
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
    port: 3000,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, "src/index.html") },
      ],
    }),
  ],
  mode: 'development'
}
