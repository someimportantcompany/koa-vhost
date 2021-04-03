require('module-alias/register');
const assert = require('assert');
const integration = require('mocha-axios');
const Koa = require('koa');
const moduleAlias = require('module-alias');
const rewire = require('rewire');

moduleAlias.addAlias('koa-vhost', __dirname);

describe('koa-vhost', () => {
  const vhost = rewire('./index');

  describe('middleware', () => {
    const app = new Koa();

    app.use(vhost('s1.example.com', ctx => {
      ctx.status = 200;
      ctx.body = 'server s1';
    }));
    it('should return "server 1" for s1.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 's1.example.com' } },
      res: { status: 200, data: 'server s1' },
    }));

    app.use(vhost(/(s2|s3).example.com/, ctx => {
      ctx.status = 200;
      ctx.body = 'server s2 or s3';
    }));
    it('should return "server s2 or s3" for s2.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 's2.example.com' } },
      res: { status: 200, data: 'server s2 or s3' },
    }));
    it('should return "server s2 or s3" for s3.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 's3.example.com' } },
      res: { status: 200, data: 'server s2 or s3' },
    }));

    app.use(vhost([ 's4.example.com', 's5.example.com' ], ctx => {
      ctx.status = 200;
      ctx.body = 'server s4 or s5';
    }));
    it('should return "server s4 or s5" for s4.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 's4.example.com' } },
      res: { status: 200, data: 'server s4 or s5' },
    }));
    it('should return "server s4 or s5" for s5.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 's5.example.com' } },
      res: { status: 200, data: 'server s4 or s5' },
    }));

    app.use(vhost('t2.example.com', ctx => {
      ctx.status = 200;
      ctx.body = 'server t2';
    }));
    it('should return "server t2" for t2.example.com', integration({
      app: app.callback(),
      req: { headers: { Host: 't2.example.com' } },
      res: { status: 200, data: 'server t2' },
    }));

    app.use(ctx => {
      ctx.status = 200;
      ctx.body = 'generic server';
    });
    it('should return "generic server" if none of the hostnames match (1/2)', integration({
      app: app.callback(),
      req: { headers: { Host: 't1.example.com' } },
      res: { status: 200, data: 'generic server' },
    }));
    it('should return "generic server" if none of the hostnames match (2/2)', integration({
      app: app.callback(),
      req: {},
      res: { status: 200, data: 'generic server' },
    }));
  });

  describe('createComparison', () => {
    before(() => {
      const createComparison = vhost.__get__('createComparison');
      assert(typeof createComparison === 'function', 'Expected createComparison to be a function');
    });

    it('should return a comparison function given a string', () => {
      const createComparison = vhost.__get__('createComparison');

      const compare = createComparison('s1.example.com');
      assert(typeof compare === 'function', 'Expected createComparison to return a function');

      assert(compare({ hostname: 's1.example.com' }), 'Expected comparison to return true');
      assert(!compare({ hostname: 's2.example.com' }), 'Expected comparison to return false');
    });

    it('should return a comparison function given an array', () => {
      const createComparison = vhost.__get__('createComparison');

      const compare = createComparison([ 's1.example.com', 's2.example.com' ]);
      assert(typeof compare === 'function', 'Expected createComparison to return a function');

      assert(compare({ hostname: 's1.example.com' }), 'Expected comparison to return true');
      assert(compare({ hostname: 's2.example.com' }), 'Expected comparison to return true');
      assert(!compare({ hostname: 's3.example.com' }), 'Expected comparison to return false');
    });

    it('should return a comparison function given a RegExp object', () => {
      const createComparison = vhost.__get__('createComparison');

      const compare = createComparison(/(s1|s2).example.com/);
      assert(typeof compare === 'function', 'Expected createComparison to return a function');

      assert(compare({ hostname: 's1.example.com' }), 'Expected comparison to return true');
      assert(compare({ hostname: 's2.example.com' }), 'Expected comparison to return true');
      assert(!compare({ hostname: 's3.example.com' }), 'Expected comparison to return false');
    });

    it('should return a comparison function given a function', () => {
      const createComparison = vhost.__get__('createComparison');

      const compare = createComparison(a => a === 'HELLO-WORLD');
      assert(typeof compare === 'function', 'Expected createComparison to return a function');

      assert(compare('HELLO-WORLD'), 'Expected comparison to return true');
      assert(!compare('HELLO-WORLD-2'), 'Expected comparison to return false');
    });

    it('should return a null if none match', () => {
      const createComparison = vhost.__get__('createComparison');

      const compare = createComparison(false);
      assert(compare === null, 'Expected createComparison to return null');
    });
  });

  describe('utils', () => {
    it('should throw an error if the value is falsey', () => {
      const assertVhost = vhost.__get__('assert');
      assert(typeof assertVhost === 'function', 'Expected assert to be a function');

      try {
        assertVhost(0, new Error('These are not the droids you are looking for, move along!'));
        assert.fail('Expected this to throw an error');
      } catch (err) {
        assert(err instanceof Error, 'Expected err to be an Error');
        assert.strictEqual(err.message, 'These are not the droids you are looking for, move along!');
      }
    });
  });
});
