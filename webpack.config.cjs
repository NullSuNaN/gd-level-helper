const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './index.js', // Your main script file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'GDParser', // Allows you to access the bundle as a global variable
    libraryTarget: 'var'
  },
  resolve: {
    fallback: {
      "zlib": require.resolve("browserify-zlib"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser"),
      "stream": false, // Disable if gdparse doesn't strictly need it
      "util": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  mode: 'development' // Use 'production' for minified code
};