// https://webpack.js.org/guides/getting-started/
import _ from 'lodash';
import { helloWorld } from './utils';

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', 'webpack', 'SERVER ENV:', window.environment], ' ');

  return element;
}

document.body.appendChild(component());
helloWorld()
