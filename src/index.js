import './index.less';

class Hotspot {
  constructor(options) {
    this.emptyFn = () => {};
    this.options = options;
    this.spots = options.spots || [];
    this.change = options.change || this.emptyFn;

    this.init();

    return {
      addSpot: this.addSpot.bind(this),
      hitTest: this.hitTest.bind(this),
      removeSpot: this.removeSpot.bind(this),
      renderSpot: this.renderSpot.bind(this),
      updateSpot: this.updateSpot.bind(this),
      getSpots: this.getSpots.bind(this),
      destroy: this.destroy.bind(this),
    };
  }
  destroy() {
    const {
      spots,
    } = this;
    const {
      target,
    } = this.options;

    try {
      document.querySelector(target).removeChild(this.container);
    } catch (error) {
      // error
    }

    spots.forEach((spot) => {
      if (spot.children) {
        if (typeof spot.children !== 'string') {
          if (spot.children.hotspot) {
            spots.children.hotspot.destroy();
          }
        }
      }
    });

    this.unbindEvent();
  }
  init() {
    const {
      target,
    } = this.options;

    const div = document.createElement('div');
    const grid = document.createElement('div');
    const items = document.createElement('div');

    div.className = 'y-hotspot-container';
    grid.className = 'y-hotspot-grid';
    items.className = 'y-hotspot-items';

    div.appendChild(items);

    if (typeof target === 'string') {
      document.querySelector(target).appendChild(div);
    } else {
      target.appendChild(div);
    }
    div.appendChild(grid);

    this.container = div;
    this.target = items;

    this.renderSpot();

    div.style.width = '100%';
    div.style.height = '100%';

    this.setSrc();
  }
  setSrc() {
    let img = null;
    const {
      container,
    } = this;
    const {
      src,
    } = this.options;
    const onload = () => {
      if (img) {
        try {
          container.removeChild(container.querySelector('img'));
        } catch (error) {
          // error;
        }
        container.appendChild(img);
      }
      if (img) {
        container.style.width = `${img.width}px`;
        container.style.height = `${img.height}px`;
      } else {
        container.style.width = '100%';
        container.style.height = '100%';
      }
    };

    if (src) {
      img = new window.Image();
      img.onload = onload;
      img.src = src;
    } else {
      onload();
    }
  }
  updateSpot(spots) {
    if (spots) {
      this.spots = spots;
    }
    this.renderSpot();
  }
  getSpots() {
    return this.spots.map((spot) => {
      const {
        children,
      } = spot;
      const data = {
        ...spot,
      };

      if (children && typeof children !== 'string') {
        data.children = {
          ...children,
          ...children.hotspot.getSpots[0],
        };
        delete data.children.hotspot;
      }
      return data;
    });
  }
  hitTest(size) {
    let isHit = null;
    const {
      spots,
    } = this;

    spots.forEach((spot, index) => {
      isHit = this.getDirection(size, spot, false, `${index}`);

      if (!isHit) {
        isHit = this.getDirection(size, spot, true, `${index}`);
      }

      if (!isHit) {
        isHit = spot.left === size.left &&
          spot.top === size.top &&
          spot.width === size.width &&
          spot.height === size.height;
      }
    });
    return isHit;
  }
  removeSpot(index) {
    if (index !== undefined) {
      this.spots = [];
    } else {
      this.spots = this.spots.splice(1, index);
    }
    this.renderSpot();
  }
  addSpot(option) {
    const {
      minWidth,
      minHeight,
    } = this.options;
    const size = {
      left: 0,
      top: 0,
      width: minWidth || 100,
      height: minHeight || 100,
      ...option,
    };

    if (!this.hitTest(size)) {
      this.spots.push(size);
      this.renderSpot();
      return true;
    }
    return false;
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
        children,
      } = spot;
      let resizeWidth = false;
      let resizeHeight = false;
      let dotPos = 'auto';

      if (!resize || (typeof resize === 'boolean' && resize)) {
        resizeWidth = true;
        resizeHeight = true;
      } else if (resize) {
        resizeWidth = resize.width !== false;
        resizeHeight = resize.height !== false;
      }

      if (resizeWidth && !resizeHeight) {
        dotPos = 'right';
      }

      if (!resizeWidth && resizeHeight) {
        dotPos = 'bottom';
      }

      return `<div
        class="y-hotspot-item"
        style="left:${left}px; top:${top}px; width:${width}px; height:${height}px;"
      >
      ${children && typeof children === 'string' ? children : ''}
      ${resize ? `<div class="y-hotspot-dot ${dotPos}"></div>` : ''}
      </div>`;
    };

    target.innerHTML = spots.map(spot => spotTpl(spot)).join('');

    this.unbindEvent();
    this.bindEvent();
    this.renderChild();
  }
  renderChild() {
    const {
      spots,
    } = this;
    const items = this.getItems();

    items.forEach((item, index) => {
      if (spots[index].children) {
        if (typeof spots[index].children !== 'string') {
          if (spots[index].children.hotspot) {
            spots[index].children.hotspot.destroy();
          }
          spots[index].children.hotspot = new Hotspot({
            target: item,
            spots: [spots[index].children],
            change(childSpots) {
              spots[index].children = {
                ...spots[index].children,
                ...childSpots[0],
              };
            },
          });
        }
      }
    });
  }
  checkChild() {
    const {
      spots,
    } = this;
    const {
      children,
      width,
      height,
    } = spots[this.currentSpot];

    if (children && typeof children !== 'string') {
      const {
        hotspot,
      } = children;
      const childSpot = hotspot.getSpots()[0];
      let {
        left: cLeft,
        top: cTop,
        // eslint-disable-next-line
        width: cWidth,
        // eslint-disable-next-line
        height: cHeight,
      } = childSpot;

      if (cLeft + cWidth > width) {
        cLeft = width - cWidth;
      }
      if (cTop + cHeight > height) {
        cTop = height - cHeight;
      }

      hotspot.updateSpot([{
        ...childSpot,
        left: cLeft,
        top: cTop,
      }]);
    }
  }
  bindEvent() {
    const that = this;
    const items = this.getItems();

    Array.prototype.forEach.call(items, (item, index) => {
      // eslint-disable-next-line
      item.addEventListener('mousedown', function(e) {
        e.stopPropagation();
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
    const items = this.getItems();
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

    this.updateActive();
  }
  // eslint-disable-next-line
  mouseup() {
    this.startPage = null;
    this.currentSpot = null;
    this.preMouseMove = null;
    this.mouseMoveDireciton = null;
    this.updateActive();
  }
  // eslint-disable-next-line
  mousemove(e) {
    const items = this.getItems();
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
      const spot = this.spots[currentSpot];
      const {
        resize,
      } = spot;
      let resizeWidth = false;
      let resizeHeight = false;

      if (!resize || (typeof resize === 'boolean' && resize)) {
        resizeWidth = true;
        resizeHeight = true;
      } else if (resize) {
        resizeWidth = resize.width !== false;
        resizeHeight = resize.height !== false;
      }

      let size = null;
      const x = e.pageX - pageX;
      const y = e.pageY - pageY;

      if (isResize) {
        size = this.getSize(
          left,
          top,
          resizeWidth ? width + x : width,
          resizeHeight ? height + y : height,
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

      // 尺寸变动事件
      if (this.change) {
        this.change(this.spots);
      }

      this.checkChild();
    }
  }
  getMinSize() {
    let {
      minWidth = 0, minHeight = 0,
    } = this.options;
    const {
      currentSpot,
    } = this;
    const spot = this.spots[currentSpot];

    if (spot.minWidth) {
      // eslint-disable-next-line
      minWidth = spot.minWidth;
    }
    if (spot.minHeight) {
      // eslint-disable-next-line
      minHeight = spot.minHeight;
    }

    if (spot && spot.children) {
      if (minWidth < spot.children.width) {
        minWidth = spot.children.width;
      }
      if (minHeight < spot.children.height) {
        minHeight = spot.children.height;
      }
    }

    return {
      minWidth,
      minHeight,
    };
  }
  getSize(left, top, width, height, isResize) {
    const {
      minWidth,
      minHeight,
    } = this.getMinSize();
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
        let isHit = this.getDirection(size, spot, false, `${currentSpot}${index}`);

        if (!isHit) {
          isHit = this.getDirection(size, spot, true, `${currentSpot}${index}`);
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
  getDirection(spot1, spot2, isReverse = false, tag) {
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
  getItems() {
    const items = this.container.querySelectorAll('.y-hotspot-item');

    return Array.prototype.filter
      .call(items, item => item.parentElement.parentElement === this.container);
  }
  getLastItems() {
    const items = this.getItems();

    return items[items.length - 1];
  }
  updateActive() {
    const items = this.getItems();

    this.removeClass(items, 'active');

    if (this.currentSpot !== undefined && this.currentSpot !== null) {
      this.addClass(items[this.currentSpot], 'active');
    }
  }
  addClass(el, cls) {
    let els = [];

    if (!el.length) {
      els = [el];
    } else {
      els = el;
    }

    Array.prototype.forEach.call(els, (item) => {
      // eslint-disable-next-line
      item.className =
        `${item.className.split(' ').filter(c => c.trim() !== cls).join(' ')} ${cls}`;
    });
  }
  removeClass(el, cls) {
    let els = [];

    if (!el.length) {
      els = [el];
    } else {
      els = el;
    }

    Array.prototype.forEach.call(els, (item) => {
      // eslint-disable-next-line
      item.className = item.className.split(' ').filter(c => c.trim() !== cls).join(' ');
    });
  }
}

export default Hotspot;
