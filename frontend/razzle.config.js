const webpack = require("webpack")
const { resolve } = require("path");

module.exports = {
  plugins: [
    {
      name: "bundle-analyzer",
      options: {
        bundleAnalyzerConfig: {
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: resolve(__dirname, "./build/metadata/stats.json"),
          reportFilename: resolve(
            __dirname,
            "./build/metadata/bundle-size-report.html"
          ),
        },
      },
    },
  ],
  modifyWebpackConfig({
    env: {
      target, // the target 'node' or 'web'
      dev, // is this a development build? true or false
    },
    webpackConfig, // the created webpack config
  }) {
    if (dev === false && target === "web") {
      //note: plan to re-enable once the app is more fleshed out, and can think about lazy loading
      webpackConfig.performance = {
        hints: false,
      };
    }

    if (dev === false && target === "node") {
      const idx = webpackConfig.plugins.findIndex(plugin => plugin.constructor.name === 'DefinePlugin');
      const { definitions } = webpackConfig.plugins[idx];
      const newDefs = Object.assign({}, definitions);
      
      delete newDefs['process.env.PORT'];
      delete newDefs['process.env.HOST'];
      delete newDefs['process.env.PUBLIC_PATH'];

      webpackConfig.plugins = [].concat(webpackConfig.plugins);
      webpackConfig.plugins[idx] = new webpack.DefinePlugin(newDefs)
    }

    return webpackConfig;
  }
};
