
const fs = require('fs');
const http = require('http');
const https = require('https');
const URL = require('url');
const querystring = require('querystring');

const promisify = require('./promisify');

// 取消node默认的禁止未认证https请求
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = promisify(request);

/**
 * 发起请求，封装http.request
 * @param opts
 *  opts.timeout
 *  opts.method
 *  opts.url
 *  opts.query
 *  opts.body
 *  opts.headers
 *  opts.proxy
 * @param cb
 */
function request(opts, cb) {
  // 预处理参数
  if (typeof opts === 'string') opts = { url: opts };
  opts = optsDefault(opts);

  opts.query = Object.assign(querystring.parse(URL.parse(opts.url).query), opts.query);

  if (opts.url.includes('?')) opts.url = opts.url.slice(0, opts.url.indexOf('?'));
  opts.url += `?${querystring.stringify(opts.query)}`;

  // 生成postData
  const postData = createPostData(opts);
  let {
    protocol, hostname, port, path,
  } = URL.parse(opts.url);
  // 代理
  let proxyProtocol;
  if (opts.proxy) {
    path = opts.url;
    const proxyParse = URL.parse(opts.proxy);
    hostname = proxyParse.hostname;
    port = proxyParse.port;
    proxyProtocol = proxyParse.protocol;
  }

  let chunks = new Buffer('');
  let timeoutId;
  const requester = (proxyProtocol || protocol) === 'https:' ? https.request : http.request;
  const req = requester({
    method: opts.method,
    hostname,
    port,
    path,
    headers: opts.headers,
  }, (res) => {
    res.on('end', () => {
      clearTimeout(timeoutId);
      res.body = chunks.toString();
      return cb(null, res);
    });
    if (opts.save) {
      res.pipe(fs.createWriteStream(opts.save));
    } else if (opts.pipe) {
      res.pipe(opts.pipe);
    } else {
      res.on('data', (chunk) => {
        chunks = Buffer.concat([chunks, chunk]);
      });
    }
  });
  req.on('error', (err) => {
    clearTimeout(timeoutId);
    if (cb) cb(err);
  });

  // 超时处理
  timeoutId = setTimeout(() => {
    req.emit('error', new Error('request-timeout'));
  }, opts.timeout);


  if (!['GET', 'HEAD'].includes(opts.method)) {
    if (postData.pipe) postData.pipe(req);
    else {
      req.write(postData);
      req.end();
    }
  } else req.end();
}

function createPostData(opts) {
  let postData = '';
  if (!['GET', 'HEAD'].includes(opts.method)) {
    if (opts.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      postData = querystring.stringify(opts.body);
      opts.headers['Content-Length'] = Buffer.byteLength(postData);
    } else if (opts.headers['Content-Type'] === 'application/json') {
      postData = JSON.stringify(opts.body);
      opts.headers['Content-Length'] = Buffer.byteLength(postData);
    } else if (opts.headers['Content-Type'] === 'text/plain') {
      postData = opts.body.toString();
      opts.headers['Content-Length'] = Buffer.byteLength(postData);
    }
  }
  return postData;
}

function optsDefault(opts) {
  opts.method = opts.method || 'GET';
  opts.url = opts.uri || opts.url;
  if (!opts.url) throw new Error('Missing param opts.url');
  opts.timeout = opts.timeout || 9000;
  opts.headers = opts.headers || {};
  opts.headers['User-Agent'] = opts.headers['user-agent'] || opts.headers['User-Agent'] || 'pz-request-0.0.1';
  opts.headers['Content-Type'] = opts.headers['content-type'] || opts.headers['Content-Type'] || 'application/x-www-form-urlencoded';
  opts.query = opts.query || {};
  opts.body = opts.body || (opts.headers['Content-Type'] === 'text/plain' ? '' : {});
  return opts;
}
