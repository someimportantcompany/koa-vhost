function assert(value, err) {
  if (Boolean(value) === false) {
    throw err;
  }
}

function createComparison(vhosts) {
  if (typeof vhosts === 'function') {
    return vhosts;
  } else if (Array.isArray(vhosts)) {
    vhosts = vhosts.map(hostname => `${hostname}`);
    return ({ hostname }) => vhosts.includes(hostname);
  } else if (Object.prototype.toString.call(vhosts) === '[object RegExp]') {
    return ({ hostname }) => vhosts.test(hostname);
  } else if (typeof vhosts === 'string') {
    return ({ hostname }) => vhosts === hostname;
  } else {
    return null;
  }
}

module.exports = function createVhosts(vhosts, middleware) {
  const compare = createComparison(vhosts);
  assert(typeof compare === 'function', new TypeError('Expected vhosts to be a: function | Array | RegExp | string'));
  assert(typeof middleware === 'function', new TypeError('Expected vhost middleware to be a function'));

  return async function vhost(ctx, next) {
    return (await compare(ctx)) ? middleware(ctx, next) : next();
  };
};
