import { WebpackBridge, IDevMiddleware } from './WebpackBridge';

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

    const options = {
      webpackOutputFolder: 'webpackOutputFolder',
    };
    const webpackBridge = new WebpackBridge(options, mockWebpackDevMiddleware);

    test('html', () => {
      expect(webpackBridge.html()).toBe('htmlTemplate');
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
