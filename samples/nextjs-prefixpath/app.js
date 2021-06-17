"use strict";
const next = require('next');
const isDev = false;
console.log(__dirname);
const nextApp = next({ dev:isDev,
  dir: __dirname,
  conf: { distDir: '.next'},
 });
const handle =  nextApp.getRequestHandler();
module.exports = async function(context, callback) {
  console.log(context.request.url);
  nextApp.prepare().then(() => handle(context.request, context.response));
}
