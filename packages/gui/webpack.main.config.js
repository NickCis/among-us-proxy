if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const config = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    modules: ['node_modules', '../../node_modules'],
  },
};

if (process.platform === 'linux') {
  const fs = require('fs');
  const path = require('path');
  const util = require('util');
  const chmod = util.promisify(fs.chmod);

  config.plugins = [
    ...(config.plugins || []),
    {
      apply(compiler) {
        compiler.hooks.done.tapPromise('chmod-plugin', async stats => {
          const output = stats.compilation.options.output.path;

          for (const asset of stats.toJson({}).assets) {
            if (!asset.name.startsWith('native_modules')) continue;
            await chmod(path.join(output, asset.name), 0o775);
          }
        });
      },
    },
  ];
}

module.exports = config;
