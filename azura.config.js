const config = {
  environment: 'development',
  server: {
    port: process.env.PORT || 5000,
    cluster: false,
    ipHost: true,
    https: true
  },
  logging: {
    enabled: true,
    showDetails: true
  },
  plugins: {
    cors: {
      enabled: true,
      origins: ['*']
    },
    rateLimit: {
      enabled: true,
      limit: 100,
      timeframe: 60000
    }
  }
};

module.exports = config;
