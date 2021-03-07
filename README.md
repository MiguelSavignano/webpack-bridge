## Webpack Bridge

Make a bridge between client side and server side allowing use server variables in the generated html by webpack.

```
-- client
---- index.js
---- public/index.html
---- webpack.config.js
---- package.json
-- server
---- index.js
---- package.json
```

Full Example:

```js
// server/index.js
const webpackDevmiddleware = require('webpack-dev-middleware');
const { webpackBridge } = require('webpack-bridge');
const webpackConfig = require('./webpack.config');

// Load only for developments environments
if (process.env.NODE_ENV !== 'production'))+ { {
  const webpack = require('webpack');
  const webpackDevmiddleware = require('webpack-dev-middleware');

  app.use(
    webpackDevmiddleware(webpack(webpackConfig), {
      index: false,
      serverSideRender: true,
    }),
  );
}

app.use(webpackBridge({ webpackOutputFolder: './dist' }), () => {
  app.use(express.static('./dist')); // in production environment render the static js, css if is necessary
});

app.get('/', (req, res) => {
  // Your server data
  const data = {
    lang: res.getHeaders().lang,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: res.user,
      __REDUX_INITIAL_STATE__: { environment: process.env.NODE_ENV },
    }),
  };

  const webpackBridge = new WebpackBridge(res.webpackBridge)
  // Custom tags {%= variable %} for works with webpack html template plugin template
  const html = webpackBridge.renderHtml(ejs)('index.html', data)
  res.send(html);
});
```

```js
const htmlTemplate = webpackBridge.html('index.html'); // html bundled with webpack html plugin
```

## Html example:

```html
<!DOCTYPE html>
<html lang="{%= lang %}">
  <script>
    {%- SERVER_GLOBALS %}
  </script>
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

1 render variables in webpack build (HTML plugin)
2 render server variables (Webpack bridge).

TODO List

- [] Add Css example
- [] Refactor WebpackBridgeDev and WebpackBridgeStatic
