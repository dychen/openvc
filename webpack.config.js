'use strict';

var webpack = require('webpack');
var path = require('path');

var SRC_DIR = path.resolve(__dirname, 'client/src');
var OUT_DIR = path.resolve(__dirname, 'client/dist');

var config = {
  entry: {
    javascript: SRC_DIR + '/index.jsx',
    html: SRC_DIR + '/index.html'
  },
  output: {
    path: OUT_DIR,
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: SRC_DIR,
        loader: 'babel-loader',
        query: {
            presets: ['es2015', 'react']
        }
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]"
      }
    ]
  }
};

module.exports = config;
