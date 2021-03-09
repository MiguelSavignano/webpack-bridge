import { WebpackBridge } from './WebpackBridge';

describe('WebpackBridge', () => {
  describe('development mode', () => {
    const mockWebpackDevMiddleware = {
      stats: {
        toJson() {
          return {
            outputPath: 'outputPath',
          };
        },
      },
      outputFileSystem: {
        readFileSync: (arg0: string, arg1: string) => 'htmlTemplate',
      },
    };

    const webpackBridge = new WebpackBridge();
    webpackBridge.webpackDevMiddleware = mockWebpackDevMiddleware;

    test('html', () => {
      expect(webpackBridge.html()).toEqual('htmlTemplate');
    });

    test('handler', () => {
      expect(webpackBridge.handler('/')).toEqual('/');
      expect(webpackBridge.handlePaths).toEqual(['/']);
    });

    test('staticMiddleware', (done) => {
      webpackBridge.handler('/');
      const middleware = webpackBridge.staticMiddleware(() => 'STATIC');
      middleware({ path: '/' }, {}, () => {
        done();
      });
    });

    test('staticMiddleware with static', (done) => {
      webpackBridge.handler('/');
      const middleware = webpackBridge.staticMiddleware((req, res, next) =>
        done(),
      );
      middleware({ path: '/app.js' }, {}, null);
    });

    test('setGlobals', () => {
      expect(
        webpackBridge.setGlobals({ __CURRENT_USER__: { name: 'name' } }),
      ).toBe(`window.__CURRENT_USER__ = JSON.parse('{\"name\":\"name\"}')`);

      expect(webpackBridge.setGlobals({ __A: 1, __B: 2 }))
        .toMatchInlineSnapshot(`
        "window.__A = JSON.parse('1')
        window.__B = JSON.parse('2')"
      `);
    });
  });
});
