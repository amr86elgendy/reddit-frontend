module.exports = {
  async headers() {
    return [
      {
        source: '/specific/:path*',
        has: [
          {
            type: 'query',
            key: 'page',
            value: 'home',
          },
          {
            type: 'cookie',
            key: 'authorized',
            value: 'true',
          },
        ],
        headers: [
          {
            key: 'x-authorized',
            value: ':authorized',
          },
        ],
      },
    ];
  },
  images: {
    domains: ['www.gravatar.com', process.env.APP_DOMAIN],
  },
};
