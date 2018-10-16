import Hotspot from '../src';

import './index.scss';

const minWidth = 130;
const minHeight = 50;

const defaultChild = {
  left: 0,
  top: 0,
  width: 110,
  height: 30,
  minWidth: 110,
  minHeight: 30,
  children: `
    <div class="hotspot-title-item">
      <span></span>
      <div>热点标题热点标题热点</div>
    </div>
  `,
};

// eslint-disable-next-line
let spots = [{
  left: 0,
  top: 0,
  width: 130,
  height: 50,
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
