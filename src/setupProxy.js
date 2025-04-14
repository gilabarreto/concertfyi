const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/ticketmaster',
    createProxyMiddleware({
      target: 'https://app.ticketmaster.com',
      changeOrigin: true,
      pathRewrite: {
        '^/ticketmaster': '',
      },
    })
  );

  app.use(
    '/setlist',
    createProxyMiddleware({
      target: 'https://api.setlist.fm',
      changeOrigin: true,
      pathRewrite: {
        '^/setlist': '',
      },
    })
  );
};
