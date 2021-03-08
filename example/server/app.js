const ejs = require('ejs');
const fs = require('fs');
const express = require('express');
const { webpackBridge, WebpackBridge } = require('../../lib');
const webpackConfig = require('../client/webpack.config');

const app = express();

console.log('*****', process.env.NODE_ENV);
// Required for handler HTML in the server side

if (process.env.NODE_ENV !== 'production') {
  console.log('Apply webpack dev middleware');
  const webpack = require('webpack');
  const webpackDevmiddleware = require('webpack-dev-middleware');

  app.use(
    webpackDevmiddleware(webpack(webpackConfig), {
      index: false,
      serverSideRender: true,
    }),
  );
}

app.use(
  webpackBridge({ webpackOutputFolder: './dist' }, () => {
    // In production environment render the static assets if is necessary
    app.use(express.static('./dist'));
  }),
);

app.get('/', (req, res) => {
  const webpackBridge = new WebpackBridge();
  const data = {
    lang: res.getHeaders().lang,
    environment: process.env.NODE_ENV,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: { name: 'name' },
      environment: process.env.NODE_ENV,
    }),
  };
  // Compatible with html template
  const html = webpackBridge.renderHtml(ejs)('index.html', data)
  // res.json({html});

  res.send(html);
});

app.get('/html', (req, res) => {
  const { webpackBridge } = res;
  const htmlTemplate = webpackBridge.html('index.html'); // html bundled with webpack html plugin
  const data = {
    lang: res.getHeaders().lang,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: { name: 'name' },
      environment: { environment: process.env.NODE_ENV },
    }),
  };
  res.json({ data, htmlTemplate });
});

app.get('/build', (req, res) => {
  const webpackBridge = new WebpackBridge();
  const htmlTemplate = webpackBridge.html('index.html'); // html bundled with webpack html plugin
  const data = {
    lang: res.getHeaders().lang,
    environment: process.env.NODE_ENV,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: { name: 'name' },
      environment: process.env.NODE_ENV,
    }),
  };
  // Compatible with html template
  const html = ejs.render(htmlTemplate, data, webpackBridge.ejsSyntaxOptions);
  res.send(html);
});

app.get('/server', (req, res) => {
  const webpackBridge = new WebpackBridge();
  const htmlTemplate = fs.readFileSync(
    __dirname + '/serverTemplate.html',
    'utf8',
  ); // html bundled with webpack html plugin
  const data = {
    allJsTags: webpackBridge.allJsTags('main'),
    lang: res.getHeaders().lang,
    environment: process.env.NODE_ENV,
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: { name: 'name' },
      environment: process.env.NODE_ENV,
    }),
  };
  const html = ejs.render(htmlTemplate, data);
  res.send(html);
});

module.exports = app;
