import Hotspot from '../src';

import './index.css';

// eslint-disable-next-line
const hotspot = new Hotspot({
  target: '#container',
  src: require('./640x360.png'),
  minWidth: 100,
  minHeight: 100,
  spots: [{
    left: 0,
    top: 0,
    width: 200,
    height: 200,
    spots: [{
      top: 0,
      left: 0,
      width: 100,
      height: 50,
      resize: false,
    }],
  }],
});

window.hotspot = hotspot;
