const webpack = require('webpack');
const webpackDevmiddleware = require('webpack-dev-middleware');
const { webpackDevBridge } = require('../../lib/webpackDevBridge');
const webpackConfig = require('../client/webpack.config');

const app = require('express')();

// Required for handler HTML in the server side
app.use(
  webpackDevmiddleware(webpack(webpackConfig), {
    index: false,
    serverSideRender: true,
  }),
);
app.use(webpackDevBridge());

app.get('/config', (req, res) => {
  const { webpackBridge } = res;
  return res.json({
    success: true,
    assetsByChunkName: webpackBridge.jsonWebpackStats.assetsByChunkName,
    outputPath: webpackBridge.outputPath,
  });
});

app.get('/', (req, res) => {
  const { webpackBridge } = res;
  const htmlTemplate = webpackBridge.html('index.html'); // html bundled with webpack html plugin
  const data = {
    lang: res.getHeaders().lang,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: { name: 'name' },
      __REDUX_INITIAL_STATE__: { environment: process.env.NODE_ENV },
    }),
  };
  res.json({ data });

  // Compatible with react-create-app html template
  // const options = ctx.webpackBridge.ejsSyntaxOptions('cutom'); // {%= variable %}
  // const html = ejs.render(htmlTemplate, data, options);

  // res.send(html);
});

app.listen(process.env.PORT || 3000);
