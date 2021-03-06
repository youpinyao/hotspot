import './index.less';

class Hotspot {
  constructor(options) {
    this.emptyFn = () => {};
    this.options = options;
    this.spots = options.spots || [];
    this.change = options.change || this.emptyFn;

    this.currentSpot = null;

    this.init();

    return {
      addSpot: this.addSpot.bind(this),
      hitTest: this.hitTest.bind(this),
      removeSpot: this.removeSpot.bind(this),
      renderSpot: this.renderSpot.bind(this),
      updateSpot: this.updateSpot.bind(this),
      getSpots: this.getSpots.bind(this),
      destroy: this.destroy.bind(this),
      setSrc: this.setSrc.bind(this),
      hasHit: this.hasHit.bind(this),
      getContainer: () => this.container,
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
            spot.children.hotspot.destroy();
          }
        }
      }
    });

    this.unbindEvent();
  }
  init() {
    const {
      target,
      width,
      height,
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

    div.style.width = width ? `${width}px` : '100%';
    div.style.height = height ? `${height}px` : '100%';

    this.setSrc(this.options.src);
  }
  setSrc(newSrc = '') {
    let img = null;
    const {
      container,
    } = this;
    let {
      src,
    } = this.options;
    const {
      width,
      height,
    } = this.options;

    const removeImg = () => {
      try {
        Array.prototype
          .forEach.call(container.querySelectorAll('img'), el => container.removeChild(el));
      } catch (error) {
        // error;
      }
    };

    src = newSrc;

    this.options.src = newSrc;

    const onload = () => {
      if (img) {
        removeImg();
        container.appendChild(img);
      }
      if (img) {
        container.style.width = `${img.width}px`;
        container.style.height = `${img.height}px`;
      } else {
        container.style.width = width ? `${width}px` : '100%';
        container.style.height = height ? `${height}px` : '100%';
      }
    };

    if (src) {
      img = new window.Image();
      img.onload = onload;
      this.getBase64(src).then((sr) => {
        img.src = sr;
      });
    } else {
      removeImg();
      onload();
    }
  }
  getBase64(src) {
    const img = new window.Image();

    img.crossOrigin = '*';

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = src;
    });
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
        ...this.getMinSize(),
      };

      if (children && typeof children !== 'string') {
        data.children = {
          ...children,
          ...children.hotspot.getSpots()[0],
        };
        delete data.children.hotspot;
      }
      return data;
    });
  }
  hasHit() {
    const {
      spots,
    } = this;

    let hasHit = false;

    spots.forEach((spot, i) => {
      if (this.hitTest(spot, i)) {
        hasHit = true;
      }
    });

    return hasHit;
  }
  hitTest(size, currentSpot) {
    let isHit = null;
    const {
      spots,
    } = this;

    spots.forEach((spot, index) => {
      if (currentSpot !== index) {
        if (!isHit) {
          isHit = this.getDirection(size, spot, false, `${index}`);
        }
        if (!isHit) {
          isHit = this.getDirection(size, spot, true, `${index}`);
        }

        if (!isHit) {
          isHit = spot.left === size.left && spot.top === size.top;
        }
      }
    });
    return isHit;
  }
  removeSpot(index) {
    if (index === undefined) {
      this.spots = [];
    } else {
      this.spots.splice(index, 1);
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
    const spotTpl = (spot, index) => {
      const {
        left,
        top,
        width,
        height,
        resize = true,
        children,
        extra,
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
      ${typeof extra === 'function' ? extra(spot, index) : (extra || '')}
      </div>`;
    };

    target.innerHTML = spots.map((spot, index) => spotTpl(spot, index)).join('');

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
            change: (childSpots) => {
              spots[index].children = {
                ...spots[index].children,
                ...childSpots[0],
              };
              if (this.change) {
                this.change(this.spots);
              }
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
        if (/stop-propagation/g.test(e.target.className)) {
          e.stopPropagation();
        }
        that.mousedown.bind(that)(e, index);
      });
    });

    // eslint-disable-next-line
    this._mouseup = function(e) {
      if (/stop-propagation/g.test(e.target.className)) {
        e.stopPropagation();
      }
      that.mouseup.bind(that)(e);
    };
    // eslint-disable-next-line
    this._mousemove = function(e) {
      if (/stop-propagation/g.test(e.target.className)) {
        e.stopPropagation();
      }
      if (that.currentSpot !== null) {
        that.mousemove.bind(that)(e);
      }
      // TODO
      // if ((that.currentSpot !== null &&
      // that.isParentElement(e.target, items[that.currentSpot])) ||
      //   (that.startPage && that.startPage.isResize === true)) {
      //   that.mousemove.bind(that)(e);
      // }
      // if (that.currentSpot !== null &&
      // !that.isParentElement(e.target, items[that.currentSpot]) &&
      //   that.startPage && that.startPage.isResize === false) {
      //   that.startPage = null;

      //   that.clearPreSpot();
      // }
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
    } else {
      this.startPage.isResize = false;
    }

    this.updateActive();

    // eslint-disable-next-line
    this._mousemove(e);
  }
  mouseup() {
    this.startPage = null;
    this.currentSpot = null;
    this.updateActive();
  }
  // eslint-disable-next-line
  mousemove(e) {
    if (!this.startPage) {
      const spot = this.spots[this.currentSpot];
      this.startPage = {
        pageX: e.pageX,
        pageY: e.pageY,
        left: spot.left,
        top: spot.top,
        width: spot.width,
        height: spot.height,
      };
    }
    const items = this.getItems();
    const {
      startPage,
      currentSpot,
      options: {
        scale = 1,
      },
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
      const x = (e.pageX - pageX) / scale;
      const y = (e.pageY - pageY) / scale;

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

      // TODO
      // const {
      //   size: newSize,
      // } = this.getHitSize(size, isResize);

      // size = newSize;

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
  clearPreSpot() {
    Object.keys(this).forEach((key) => {
      if (/_preSpot/g.test(key)) {
        delete this[key];
      }
    });
  }
  beyondTest(size) {
    const {
      clientWidth,
      clientHeight,
    } = this.target;
    const {
      left,
      top,
      width,
      height,
    } = size;

    if (left < 0) {
      return true;
    }
    if (top < 0) {
      return true;
    }
    if ((left + width) > clientWidth) {
      return true;
    }
    if ((top + height) > clientHeight) {
      return true;
    }
    return false;
  }
  getMinSize() {
    let {
      minWidth = 0, minHeight = 0,
    } = this.options;
    const {
      currentSpot,
    } = this;
    const spot = this.spots[currentSpot || 0];

    if (spot && spot.minWidth) {
      // eslint-disable-next-line
      minWidth = spot.minWidth;
    }
    if (spot && spot.minHeight) {
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
  getSize(left, top, width, height, isResize = false) {
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
    const {
      clientWidth,
      clientHeight,
    } = this.target;
    const size = {
      left,
      top,
      width,
      height,
    };

    spots.forEach((spot, index) => {
      if (currentSpot !== index) {
        let isHit = this.getDirection(size, spot, false, `${currentSpot}${index}`);

        if (!isHit) {
          isHit = this.getDirection(size, spot, true, `${currentSpot}${index}`);
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
              size.top = spot.top - size.height - 1;

              if (size.top < 0) {
                size.top = 0;

                if (size.left < spot.left + spot.width) {
                  size.left = spot.left + spot.width + 1;
                }
              }
            }
          }
          if (isHit.direction === 'bottom') {
            if (isResize) {
              // 不存在
            } else {
              size.top = spot.top + spot.height + 1;

              if (size.top >= clientHeight - size.height) {
                size.top = clientHeight - size.height;

                if (size.left < spot.left + spot.width) {
                  size.left = spot.left + spot.width + 1;
                }
              }
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
              size.left = spot.left - size.width - 1;
              if (size.left < 0) {
                size.left = 0;
                if (size.top < spot.top + spot.height) {
                  size.top = spot.top + spot.height + 1;
                }
              }
            }
          }
          if (isHit.direction === 'right') {
            if (isResize) {
              // 不存在
            } else {
              size.left = spot.left + spot.width + 1;

              if (size.left >= clientWidth - size.width) {
                size.left = clientWidth - size.width - 1;

                if (size.top < spot.top + spot.height) {
                  size.top = spot.top + spot.height + 1;
                }
              }
            }
          }
        }
      }
    });

    return {
      size,
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
      const xHit = dot.x >= compareSpot.left && dot.x <= compareSpot.left + compareSpot.width;
      const yHit = dot.y >= compareSpot.top && dot.y <= compareSpot.top + compareSpot.height;
      const xHitEqual = dot.x === compareSpot.left ||
        dot.x === compareSpot.left + compareSpot.width;
      const yHitEqual = dot.y === compareSpot.top ||
        dot.y === compareSpot.top + compareSpot.height;

      if (!isReverse) {
        xpHit = dot.x >= prevSpot.left && dot.x <= prevSpot.left + prevSpot.width;
        ypHit = dot.y >= prevSpot.top && dot.y <= prevSpot.top + prevSpot.height;
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
        xpHit = dots[index].x >= spot2.left && dots[index].x <= spot2.left + spot2.width;
        ypHit = dots[index].y >= spot2.top && dots[index].y <= spot2.top + spot2.height;
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

    if (isHit && isHit.direction === 'right' && isReverse && hits.join('') === '2') {
      isHit.direction = 'top';
    }


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
      if (hits.length === 2 && hits[1] === 3 && isHit.direction === 'right') {
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
      if (hits.join('') === '03') {
        isHit.direction = 'right';
      }
      if (hits.join('') === '01' || hits.join('') === '0') {
        isHit.direction = 'bottom';
      }
    }

    // 同长 或 同宽 情况
    if (isReverse) {
      if (equalHits.join('') === '03' || hits.join('') === '03' || (equalHits.join('') === '0' &&
          hits.join('') === '3') || (hits.join('') === '0' && equalHits.join('') === '3')) {
        isHit = {
          direction: 'right',
        };
      }
      if (equalHits.join('') === '12' || hits.join('') === '12' || (equalHits.join('') === '1' &&
          hits.join('') === '2') || (hits.join('') === '1' && equalHits.join('') === '2')) {
        isHit = {
          direction: 'left',
        };
      }
      if (equalHits.join('') === '23' || hits.join('') === '23' || (equalHits.join('') === '2' &&
          hits.join('') === '3') || (hits.join('') === '2' && equalHits.join('') === '3')) {
        isHit = {
          direction: 'top',
        };
      }
      if (equalHits.join('') === '01' || hits.join('') === '01' || (equalHits.join('') === '0' &&
          hits.join('') === '1') || (hits.join('') === '0' && equalHits.join('') === '1')) {
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
  isParentElement(el, parent) {
    let newEl = el;
    let ret = false;
    if (newEl === parent) {
      ret = true;
    }
    if (newEl && /stop-propagation/g.test(newEl.className) &&
      newEl.parentElement &&
      newEl.parentElement.parentElement &&
      newEl.parentElement.parentElement !== parent
    ) {
      return false;
    }
    while (newEl.parentElement && ret === false) {
      newEl = newEl.parentElement;

      if (newEl && /stop-propagation/g.test(newEl.className) &&
        newEl.parentElement &&
        newEl.parentElement.parentElement &&
        newEl.parentElement.parentElement !== parent
      ) {
        ret = false;
        break;
      }

      if (newEl === parent) {
        ret = true;
      }
    }
    return ret;
  }
  addClass(el, cls) {
    let els = [];

    if (!el.length && el.length !== 0) {
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

    if (!el.length && el.length !== 0) {
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
