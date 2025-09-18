const path = require('path');

module.exports = {
  mode: 'development',
  entry: './web/index.js',
  output: {
    path: path.resolve(__dirname, 'web'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              'react-native-web/babel',
            ],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    port: 3001,
    hot: true,
    open: true,
  },
};
