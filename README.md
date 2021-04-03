[![NPM](https://badge.fury.io/js/%40someimportantcompany%2Fkoa-vhost.svg.svg)](https://npm.im/@someimportantcompany/koa-vhost)
[![CI](https://github.com/someimportantcompany/koa-vhost/actions/workflows/ci.yml/badge.svg)](https://github.com/someimportantcompany/koa-vhost/actions/workflows/ci.yml)
<!-- [![Coverage](https://coveralls.io/repos/github/someimportantcompany/koa-vhost/badge.svg?branch=master)](https://coveralls.io/github/someimportantcompany/koa-vhost?branch=master) -->

Virtual host splitting for [Koa.js](https://koajs.com) v2.

## Install

```
$ npm install --save @someimportantcompany/koa-vhost
```

## Usage

```js
const Koa = require('koa');
const vhost = require('@someimportantcompany/koa-vhost');

const app = new Koa();

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

app.listen(3000);
```

Then, assuming [httpie](https://httpie.io/):

```
$ http --print=HhBb http://localhost:54321
GET / HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Connection: keep-alive
Host: localhost:54321
User-Agent: HTTPie/1.0.3


HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 14
Content-Type: text/plain; charset=utf-8
Date: Sat, 03 Apr 2021 12:47:33 GMT
Keep-Alive: timeout=5

generic server
```

```
$ http --print=HhBb http://localhost:54321 Host:s1.example.com
GET / HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Connection: keep-alive
Host: s1.example.com
User-Agent: HTTPie/1.0.3

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 9
Content-Type: text/plain; charset=utf-8
Date: Sat, 03 Apr 2021 12:48:43 GMT
Keep-Alive: timeout=5

server s1
```

```
$ http --print=HhBb http://localhost:54321 Host:s2.example.com
GET / HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Connection: keep-alive
Host: s1.example.com
User-Agent: HTTPie/1.0.3

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 9
Content-Type: text/plain; charset=utf-8
Date: Sat, 03 Apr 2021 12:48:43 GMT
Keep-Alive: timeout=5

server s2 or s3
```

## API

### `vhost(hosts, middleware)`

Option | Description
---- | ----
`hosts` | Either a `Function`, `Array`, `RegExp` or `String` of the hosts to match.
`middleware` | Middleware to execute if the hostname matches.
