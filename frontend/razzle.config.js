const { resolve } = require("path");

module.exports = {
    plugins: [{
        name: 'bundle-analyzer',
        options: {
            bundleAnalyzerConfig: {
                openAnalyzer: false,
                generateStatsFile: true,
                statsFilename: resolve(__dirname, './build/metadata/stats.json'),
                reportFilename: resolve(__dirname, './build/metadata/bundle-size-report.html')
            }
        }
    }]
}