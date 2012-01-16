define(['Class'], function(Class) {
	var win = $(window),
		height = win.height(),
		queue = [],
		m = {
			node: function(n, size) { //传入节点计算top值
				n = $(n);
				return this.y(n.offset().top, size ? n.outerHeight(true) : undefined);
			},
			y: function(py, ps) { //直接传入top值，第2个参数详见size，不设置时单向计算，只要在滚动条之上的都加载
				this._y = py;
				this._s = ps || 0;
				return this;
			},
			threshold: function(th) { //传入节点计算top值
				this._th = th;
				return this;
			},
			size: function(s) { //设置size时会计算滚出区域情况，在可视区域之外都不加载
				this._s = s;
				return this;
			},
			delay: function(d) { //仅size时有效，延迟加载可是区域内，防止滚动条瞬间拖拽情况
				this._d = d;
				return this;
			},
			time: function(t) { //多少时间后加载器必定执行
				var self = this;
				self._t = t;
				setTimeout(function() {
					self.start();
				}, t);
				return self;
			},
			load: function() { //加载回调
				this._cb = this._cb.concat(Array.prototype.slice.call(arguments, 0));
				this._no && queue.push(this);
				this._no = false;
				this._f && this.fire();
				this._f = false;
				return this;
			},
			start: function() { //开始加载并清空加载器
				this._enable && this._cb.forEach(function(cb) {
					cb();
				});
				return this.cancel();
			},
			cancel: function() { //永久取消此次延迟加载
				this.disable();
				for(var i = 0, len = queue.length; i < len; i++) {
					if(queue[i] == this) {
						queue.splice(i, 1);
						break;
					}
				}
			},
			enable: function() { //设置加载状态为可用
				this._enable = true;
				return this;
			},
			disable: function() { //设置加载状态为不可用
				this._enable = false;
				return this;
			},
			fire: function(top, he) { //手动尝试触发判断加载条件
				top = top || win.scrollTop();
				he = he || height;
				var self = this;
				if(self._s) {
					clearTimeout(self._timeout);
					self._timeout = setTimeout(function() {
						if(self._enable
							&& self._y <= (top + he + self._th)
							&& (self._y + self._s) >= (top - self._th)
						)
							cb();
					}, self._d);
				}
				else {
					if(this._enable
						&& this._y <= (top + he + this._th)
					)
						cb();
				}
				function cb() {
					self._cb.forEach(function(cb) {
						cb();
					});
					self.cancel();
				}
				return this;
			}
		},
		Klass = Class(function() {
			this._y = 0; //y坐标值
			this._th = 0; //偏移量
			this._d = 0; //延迟
			this._s = 0; //尺寸，等于0的时候不侦听尺寸，即滚动条区域以上直接加载；否则判断是否在显示范围内
			this._cb = []; //回调
			this._no = true; //是否被加入侦听
			this._enable = true; //是否启用
			this._timeout = null; //延迟侦听器
			this._f = true; //首次调用状态，因为f5后一开始滚动条就有可能在下方，所以初期不onscroll也要调用
		}).methods(m),
		instance = {};

	function onScroll() {
		var top = win.scrollTop();
		queue.forEach(function(o) {
			o.fire(top, height);
		});
	}
	win.bind('resize', function() {
		height = win.height();
		onScroll();
	});
	win.bind('scroll', onScroll);

	Object.keys(m).forEach(function(key) {
		instance[key] = function() {
			var obj = new Klass;
			return obj[key].apply(obj, Array.prototype.slice.call(arguments, 0));
		};
	});
	return instance;
});