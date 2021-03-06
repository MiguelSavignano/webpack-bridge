## Webpack Bridge

Make a bridge between client side and server side.

```
.
-- node_modules
-- client
---- index.js
---- index.html
--   package.json
-- server
---- index.js
--   package.json
```

Full Example:

```js
// server/index.js
const webpackDevmiddleware = require('webpack-dev-middleware');
const { webpackDevBridge } = require('webpack-dev-bridge');
const webpackConfig = require('./webpack.config');

// Required for handler HTML in the server side
app.use(
  webpackDevmiddleware(webpackConfig, { index: false, serverSideRender: true }),
);
app.use(webpackDevBridge());

app.get('/', (req, res) => {
  const { webpackBridge } = res;
  const htmlTemplate = webpackBridge.html('index.html'); // html bundled with webpack html plugin
  const data = {
    lang: res.headers.lang,
    // serialized variables with serialize-javascript
    SERVER_GLOBALS: webpackBridge.setGlobals({
      __CURRENT_USER__: res.user,
      __REDUX_INITIAL_STATE__: { environment: process.env.NODE_ENV },
    }),
  };

  // Compatible with react-create-app html template
  const options = ctx.webpackBridge.ejsSyntaxOptions('cutom'); // {%= variable %}
  const html = ejs.render(htmlTemplate, data, options);

  res.send(html);
});
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
