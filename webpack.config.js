/*eslint-disable*/
module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: 'server/static/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react']
      }
    },
    {
      test: /\.scss$|\.css$/,
      loader: 'style-loader!css-loader!sass-loader'
    },
    {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './'
  }
};
