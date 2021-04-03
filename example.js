const Koa = require('koa');
const vhost = require('koa-vhost');

const app = module.exports = new Koa({ proxy: true });

app.use(vhost('s1.example.com', ctx => {
  ctx.status = 200;
  ctx.body = 'server s1';
}));

app.use(vhost(/(s2|s3).example.com/, ctx => {
  ctx.status = 200;
  ctx.body = 'server s2 or s3';
}));

app.use(vhost([ 's4.example.com', 's5.example.com' ], ctx => {
  ctx.status = 200;
  ctx.body = 'server s4 or s5';
}));

app.use(vhost('t2.example.com', ctx => {
  ctx.status = 200;
  ctx.body = 'server t2';
}));

app.use(ctx => {
  ctx.status = 200;
  ctx.body = 'generic server';
});

/* istanbul ignore next */
if (!module.parent) {
  /* eslint-disable no-console */
  const { HTTP_PORT = 54321 } = process.env;
  app.listen(HTTP_PORT, 'localhost', () => console.log(`Koa listening on http://localhost:${HTTP_PORT}`));
}
