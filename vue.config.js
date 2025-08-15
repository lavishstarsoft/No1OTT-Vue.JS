const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 8080
  }
})

