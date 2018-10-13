import Hotspot from '../src';

import './index.css';

// eslint-disable-next-line
const hotspot = new Hotspot({
  target: '#container',
  src: require('./640x360.png'),
  minWidth: 100,
  minHeight: 50,
  spots: [{
    left: 0,
    top: 0,
    width: 100,
    height: 50,
  }, {
    left: 100,
    top: 0,
    width: 100,
    height: 50,
  }, {
    left: 200,
    top: 0,
    width: 100,
    height: 50,
  }],
});

window.hotspot = hotspot;
