import Hotspot from '../src';

import './index.scss';

const minWidth = 230;
const minHeight = 100;

const defaultChild = {
  left: 0,
  top: 0,
  width: 100,
  height: 30,
  minWidth: 100,
  minHeight: 30,
  resize: {
    height: false,
  },
  children: `
    <div class="hotspot-title-item left">
      <span></span>
      <div>热点标题</div>
    </div>
  `,
};

// eslint-disable-next-line
let spots = [{
  left: 0,
  top: 0,
  width: minWidth + 50,
  height: minHeight,
  children: {
    ...defaultChild,
  },
}, {
  left: 300,
  top: 0,
  width: minWidth,
  height: minHeight,
  children: {
    ...defaultChild,
    children: `
      <div class="hotspot-title-item right">
        <span></span>
        <div>热点标题</div>
      </div>
    `,
  },
}];

// eslint-disable-next-line
const hotspot = new Hotspot({
  target: '#container',
  src: require('./640x360.png'),
  spots,
});

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
    hotspot.addSpot(size);
  } else {
    console.error('热点区域重复，添加失败，请修改热点区域（左上角）');
  }
}

window.addSpot = () => {
  addSpot();
};
window.hotspot = hotspot;
