import './index.less';

class Hotspot {
  constructor(options) {
    this.options = options;
    this.spots = options.spots || [];

    this.init();

    return {
      addSpot: this.addSpot,
      getSpot: () => this.spots,
      destroy: this.destroy.bind(this),
    };
  }
  destroy() {
    const {
      target,
    } = this.options;

    document.querySelector(target).removeChild(this.container);

    this.unbindEvent();
  }
  init() {
    const {
      target,
      src,
    } = this.options;

    const img = new window.Image();

    img.onload = () => {
      const div = document.createElement('div');
      const items = document.createElement('div');

      div.className = 'y-hotspot-container';
      items.className = 'y-hotspot-items';

      div.appendChild(img);
      div.appendChild(items);

      div.style.width = `${img.width}px`;
      div.style.height = `${img.height}px`;

      document.querySelector(target).appendChild(div);

      this.container = div;
      this.target = items;

      this.renderSpot();
    };

    img.src = src;
  }
  addSpot() {
    const {
      minWidth,
      minHeight,
    } = this.options;
    this.spots.push({
      left: 0,
      top: 0,
      width: minWidth || 100,
      height: minHeight || 100,
    });
    this.renderSpot();
  }
  renderSpot() {
    const {
      spots,
      target,
    } = this;
    const spotTpl = (spot) => {
      const {
        left,
        top,
        width,
        height,
        resize = true,
      } = spot;
      return `<div
        class="y-hotspot-item"
        style="left:${left}px; top:${top}px; width:${width}px; height:${height}px;"
      >
      ${resize ? '<div class="y-hotspot-dot"></div>' : ''}
      </div>`;
    };

    target.innerHTML = spots.map(spot => spotTpl(spot)).join('');

    this.bindEvent();
  }
  bindEvent() {
    const that = this;
    const items = this.container.querySelectorAll('.y-hotspot-item');

    Array.prototype.forEach.call(items, (item, index) => {
      // eslint-disable-next-line
      item.addEventListener('mousedown', function(e) {
        that.mousedown.bind(that)(e, index);
      });
    });

    // eslint-disable-next-line
    this._mouseup = function(e) {
      that.mouseup.bind(that)(e);
    };
    // eslint-disable-next-line
    this._mousemove = function(e) {
      that.mousemove.bind(that)(e);
    };

    // eslint-disable-next-line
    window.addEventListener('mousemove', this._mousemove);
    // eslint-disable-next-line
    window.addEventListener('mouseup', this._mouseup);
    // eslint-disable-next-line
    window.addEventListener('mouseleave', this._mouseup);
  }
  unbindEvent() {
    // eslint-disable-next-line
    window.removeEventListener('mousemove', this._mousemove);
    // eslint-disable-next-line
    window.removeEventListener('mouseup', this._mouseup);
    // eslint-disable-next-line
    window.removeEventListener('mouseleave', this._mouseup);
  }
  mousedown(e, index) {
    const items = this.container.querySelectorAll('.y-hotspot-item');
    const spot = this.spots[index];

    this.startPage = {
      pageX: e.pageX,
      pageY: e.pageY,
      left: spot.left,
      top: spot.top,
      width: spot.width,
      height: spot.height,
    };
    this.currentSpot = index;

    items.forEach((item) => {
      // eslint-disable-next-line
      item.style.zIndex = 1;
    });
    items[index].style.zIndex = 2;

    if (/y-hotspot-dot/g.test(e.target.className)) {
      this.startPage.isResize = true;
    }
  }
  // eslint-disable-next-line
  mouseup() {
    this.startPage = null;
    this.currentSpot = null;
    this.preMouseMove = null;
    this.mouseMoveDireciton = null;
  }
  // eslint-disable-next-line
  mousemove(e) {
    const items = this.container.querySelectorAll('.y-hotspot-item');
    const {
      startPage,
      currentSpot,
    } = this;

    if (startPage && currentSpot !== null && currentSpot !== undefined) {
      const {
        pageX,
        pageY,
        left,
        top,
        width,
        height,
        isResize,
      } = startPage;

      let size = null;
      const x = e.pageX - pageX;
      const y = e.pageY - pageY;

      if (isResize) {
        size = this.getSize(
          left,
          top,
          width + x,
          height + y,
          isResize,
        );
      } else {
        size = this.getSize(
          left + x,
          top + y,
          width,
          height,
          isResize,
        );
      }

      const {
        size: newSize,
        // eslint-disable-next-line
        hasHit,
      } = this.getHitSize(size, isResize);

      size = newSize;

      this.spots[currentSpot].left = size.left;
      this.spots[currentSpot].top = size.top;
      this.spots[currentSpot].width = size.width;
      this.spots[currentSpot].height = size.height;

      items[currentSpot].style.left = `${size.left}px`;
      items[currentSpot].style.top = `${size.top}px`;
      items[currentSpot].style.width = `${size.width}px`;
      items[currentSpot].style.height = `${size.height}px`;
    }
  }
  getSize(left, top, width, height, isResize) {
    const {
      minWidth = 100, minHeight = 100,
    } = this.options;
    const {
      target,
    } = this;

    const {
      clientWidth,
      clientHeight,
    } = target;

    const size = {
      left,
      top,
      width,
      height,
    };

    if (!isResize) {
      if (left < 0) {
        size.left = 0;
      }
      if (top < 0) {
        size.top = 0;
      }
      if ((left + width) > clientWidth) {
        size.left = clientWidth - width;
      }
      if ((top + height) > clientHeight) {
        size.top = clientHeight - height;
      }
    } else {
      if (width < minWidth) {
        size.width = minWidth;
      }
      if (height < minHeight) {
        size.height = minHeight;
      }

      if (width + left > clientWidth) {
        size.width = clientWidth - left;
      }
      if (height + top > clientHeight) {
        size.height = clientHeight - top;
      }
    }

    return size;
  }
  getHitSize({
    left,
    top,
    width,
    height,
  }, isResize) {
    const {
      spots,
      currentSpot,
    } = this;
    const size = {
      left,
      top,
      width,
      height,
    };
    let hasHit = false;

    spots.forEach((spot, index) => {
      if (currentSpot !== index) {
        let isHit = this.getDirection(size, spot, false, isResize, `${currentSpot}${index}`);

        if (!isHit) {
          isHit = this.getDirection(size, spot, true, isResize, `${currentSpot}${index}`);
        }

        if (!hasHit && isHit) {
          hasHit = isHit;
        }

        if (isHit) {
          if (isHit.direction === 'top') {
            if (isResize) {
              if (isHit.isBorder) {
                size.width = spot.left - size.left;
              } else {
                size.height = spot.top - size.top;
              }
            } else {
              size.top = spot.top - size.height;
            }
          }
          if (isHit.direction === 'bottom') {
            if (isResize) {
              // 不存在
            } else {
              size.top = spot.top + spot.height;
            }
          }
          if (isHit.direction === 'left') {
            if (isResize) {
              if (isHit.isBorder) {
                size.height = spot.top - size.top;
              } else {
                size.width = spot.left - size.left;
              }
            } else {
              size.left = spot.left - size.width;
            }
          }
          if (isHit.direction === 'right') {
            if (isResize) {
              // 不存在
            } else {
              size.left = spot.left + spot.width;
            }
          }
        }
      }
    });

    return {
      size,
      hasHit,
    };
  }
  getDirection(spot1, spot2, isReverse = false, isResize, tag) {
    const prevSpot = this[`_preSpot${tag}${isReverse}`] || spot1;

    const dot11 = {
      x: spot1.left,
      y: spot1.top,
    };
    const dot12 = {
      x: spot1.left + spot1.width,
      y: spot1.top,
    };
    const dot13 = {
      x: spot1.left + spot1.width,
      y: spot1.top + spot1.height,
    };
    const dot14 = {
      x: spot1.left,
      y: spot1.top + spot1.height,
    };

    const dot21 = {
      x: spot2.left,
      y: spot2.top,
    };
    const dot22 = {
      x: spot2.left + spot2.width,
      y: spot2.top,
    };
    const dot23 = {
      x: spot2.left + spot2.width,
      y: spot2.top + spot2.height,
    };
    const dot24 = {
      x: spot2.left,
      y: spot2.top + spot2.height,
    };

    let isHit = null;
    // eslint-disable-next-line
    const arr1 = [dot11, dot12, dot13, dot14];
    const arr2 = [dot21, dot22, dot23, dot24];
    const arr = !isReverse ? arr2 : arr1;
    const compareSpot = !isReverse ? spot1 : spot2;
    const hits = [];
    const equalHits = [];

    arr.forEach((dot, index) => {
      let xpHit = false;
      let ypHit = false;
      // eslint-disable-next-line
      let xpHitEqual = false;
      // eslint-disable-next-line
      let ypHitEqual = false;
      const xHit = dot.x > compareSpot.left && dot.x < compareSpot.left + compareSpot.width;
      const yHit = dot.y > compareSpot.top && dot.y < compareSpot.top + compareSpot.height;
      const xHitEqual = dot.x === compareSpot.left ||
        dot.x === compareSpot.left + compareSpot.width;
      const yHitEqual = dot.y === compareSpot.top ||
        dot.y === compareSpot.top + compareSpot.height;

      if (!isReverse) {
        xpHit = dot.x > prevSpot.left && dot.x < prevSpot.left + prevSpot.width;
        ypHit = dot.y > prevSpot.top && dot.y < prevSpot.top + prevSpot.height;
        xpHitEqual = dot.x === prevSpot.left || dot.x === prevSpot.left + prevSpot.width;
        ypHitEqual = dot.y === prevSpot.top || dot.y === prevSpot.top + prevSpot.height;
      } else {
        const dots = [{
          x: prevSpot.left,
          y: prevSpot.top,
        }, {
          x: prevSpot.left + prevSpot.width,
          y: prevSpot.top,
        }, {
          x: prevSpot.left + prevSpot.width,
          y: prevSpot.top + prevSpot.height,
        }, {
          x: prevSpot.left,
          y: prevSpot.top + prevSpot.height,
        }];
        xpHit = dots[index].x > spot2.left && dots[index].x < spot2.left + spot2.width;
        ypHit = dots[index].y > spot2.top && dots[index].y < spot2.top + spot2.height;
        xpHitEqual = dots[index].x === spot2.left || dots[index].x === spot2.left + spot2.width;
        ypHitEqual = dots[index].y === spot2.top || dots[index].y === spot2.top + spot2.height;
      }

      if (xHit && yHit) {
        isHit = {
          index,
        };

        if (!xpHit && xHit) {
          if (prevSpot.left < spot1.left || prevSpot.width < spot1.width) {
            isHit.direction = 'left';
          } else {
            isHit.direction = 'right';
          }
        } else if (!ypHit && yHit) {
          if (prevSpot.top < spot1.top || prevSpot.height < spot1.height) {
            isHit.direction = 'top';
          } else {
            isHit.direction = 'bottom';
          }
        }

        hits.push(index);
      }

      if ((xHitEqual && yHitEqual) || (xHitEqual && yHit) || (yHitEqual && xHit)) {
        equalHits.push(index);
      }
    });

    // 左右或上下 移动的 碰撞对象边界情况
    if (hits.length && isReverse === false) {
      if (hits.length === 1 && hits[0] === 3 && isHit.direction === 'top') {
        isHit.direction = 'left';
      }
      if (hits.length === 1 && hits[0] === 0 && isHit.direction === 'bottom') {
        isHit.direction = 'left';
      }
      if (hits.length === 1 && hits[0] === 3 && isHit.direction === 'right') {
        isHit.direction = 'bottom';
      }
      if (hits.length === 1 && hits[0] === 2 && isHit.direction === 'left') {
        isHit.direction = 'bottom';
      }
      if (hits.length === 1 && hits[0] === 1 && isHit.direction === 'bottom') {
        isHit.direction = 'right';
      }
      if (hits.length === 1 && hits[0] === 2 && isHit.direction === 'top') {
        isHit.direction = 'right';
      }
      if (hits.length === 1 && hits[0] === 0 && isHit.direction === 'right') {
        isHit.direction = 'top';
      }
      if (hits.length === 1 && hits[0] === 1 && isHit.direction === 'left') {
        isHit.direction = 'top';
      }
    }

    // 左右 或 上下 不可移动情况
    if ((isHit && !isHit.direction) && hits.length && isReverse === true) {
      if (hits.join('') === '1' || (hits.join('') === '2' && prevSpot.top === 0) || hits.join('') ===
        '12') {
        isHit = {
          direction: 'left',
          isBorder: true,
        };
      }
      if (hits.join('') === '3' || (hits.join('') === '2' && prevSpot.left === 0) || hits.join('') ===
        '23') {
        isHit = {
          direction: 'top',
          isBorder: true,
        };
      }
    }

    // 同长 或 同宽 情况
    if (!hits.length && equalHits.length && isReverse) {
      if (equalHits.join('') === '03') {
        isHit = {
          direction: 'right',
        };
      }
      if (equalHits.join('') === '12') {
        isHit = {
          direction: 'left',
        };
      }
      if (equalHits.join('') === '23') {
        isHit = {
          direction: 'top',
        };
      }
      if (equalHits.join('') === '01') {
        isHit = {
          direction: 'bottom',
        };
      }
    }

    if (!isHit) {
      this[`_preSpot${tag}${isReverse}`] = spot1;
    }

    if (isHit) {
      isHit.isReverse = isReverse;
    }

    if (hits.length) {
      // console.log('hits', isReverse, hits, isHit);
    }
    if (equalHits.length) {
      // console.log('equalHits', isReverse, equalHits, isHit);
    }

    return isHit;
  }
}

export default Hotspot;
