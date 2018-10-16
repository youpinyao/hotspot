import Hotspot from '../src';

import './index.css';

const minWidth = 100;
const minHeight = 100;
const childMinWidth = 100;
const childMinHeight = 50;

const defaultChild = {
  left: 0,
  top: 0,
  width: 100,
  height: 50,
  resize: false,
};

// eslint-disable-next-line
let spots = [{
  left: 0,
  top: 0,
  width: 200,
  height: 200,
  children: {
    ...defaultChild,
  },
}];

// eslint-disable-next-line
const hotspot = new Hotspot({
  target: '#container',
  src: require('./640x360.png'),
  minWidth,
  minHeight,
});

function addChild({
  el,
  children,
}) {
  // eslint-disable-next-line
  children.hotspot = new Hotspot({
    target: el,
    minWidth: childMinWidth,
    minHeight: childMinHeight,
    spots: [{
      ...defaultChild,
      ...children,
    }],
  });
}

function renderSpots() {
  hotspot.clearSpots();
  spots.forEach(spot => hotspot.addSpot(spot));
  hotspot.getSpots().forEach(spot => addChild(spot));
}

function addSpot(size = {
  left: 0,
  top: 0,
  width: minWidth,
  height: minHeight,
  children: {
    ...defaultChild,
  },
}) {
  if (!hotspot.hitTest(size)) {
    spots.push(size);
    renderSpots();
  } else {
    console.error('添加失败');
  }
}

function refreshSpots() {
  spots = hotspot.getSpots();

  spots.forEach((spot) => {
    // eslint-disable-next-line
    spot.children = {
      ...spot.children,
      ...spot.children.hotspot.getSpots()[0],
    };
  });
}

renderSpots();

window.addSpot = () => {
  refreshSpots();
  addSpot();
};
window.hotspot = hotspot;
