define(function() {
	var doc = $(document);
	function setCoord(node, left, top) {
		node.css({
			left: left,
			top: top
		});
	}
	function Klass(options) {
		$$.Event.call(this);
		this.options = options;
		this.left = this.top = 0;
		this.split = [];
		this.lastContainer = null;
		this.tempContainer = null;
		this.lastIndex = 0;
		this.tempIndex = 0;
		this._init();
	}
	$$.inheritPrototype(Klass, $$.Event);
	Klass.prototype._reset = function() {
		var self = this,
			op = self.options,
			container = $(op.container);
		self.split = [];
		container.each(function(i, o) {
			o = $(o);
			//忽略被隐藏的容器
			if(o.css('display') == 'none') {
				return;
			}
			self.split.push({
				node: o,
				first: o.offset().left,
				second: []
			});
		});
		self.split.sort(function(a, b) {
			return a.first > b.first;
		});
		self.split.forEach(function(o) {
			var drags = o.node.children(op.drag),
				len = drags.length - 1;
			drags.each(function(i, n) {
				n = $(n);
				if(i > 0)
					o.second.push(n.offset().top);
				if(i == len)
					o.second.push(n.offset().top + n.outerHeight());
			});
		});
	}
	Klass.prototype._init = function() {
		var self = this,
			op = self.options,
			container = $(op.container);
		container.delegate(op.handler, 'mousedown', function(e) {
			self._reset();
			var node = $(this).parent(op.drag),
				position = node.css('position'),
				left = node.css('left'),
				right = node.css('right'),
				con = node.parent();
			//取得鼠标点下的坐标
			self.left = node.offset().left - node.parent().offset().left;
			self.top = node.offset().top - node.parent().offset().top;
			//设置lastContainer和tempContainer为此节点的父容器
			self.lastContainer = self.tempContainer = con[0];
			//设置lastIndex为此节点在父容器中的次序
			con.children(op.drag).each(function(i, o) {
				if(node[0] == o) {
					self.lastIndex = self.tempIndex = i;
				}
			});
			//设置绝对定位和坐标
			node.css('position', 'absolute');
			setCoord(node, self.left, self.top);

			doc.mousemove(move);
			doc.mouseup(function(e) {
				//还原节点最初的css属性
				node.css('position', position);
				setCoord(node, left, right);
				//如果realTime不设置为true，说明不是实时改变拖动块的位置，而是在drag:end再改变，需侦听
				if(!op.realTime) {
					self._switch(node, $(self.tempContainer), self.tempIndex, true);
				}
				//解除事件侦听
				doc.unbind('mousemove', move);
				doc.unbind('mouseup', arguments.callee);
				self.trigger('drag:end', [node]);
			});
			function move(evt) {
				self._onMoveHandler(node, e, evt);
				return false;
			}
			self.trigger('drag:start', [node]);
			return false;
		});
	}
	Klass.prototype._onMoveHandler = function(node, se, ne) {
		var left = this.left + ne.pageX - se.pageX,
			top = this.top + ne.pageY - se.pageY;
		setCoord(node, left, top);
		this.trigger('drag:move', [node]);
		//检查是否发生了模块移动，先从左至右寻找容器
		var i = j = 0,
			len = this.split.length;
		for(; i < len; i++) {
			if(this.split[i].first >= ne.pageX) {
				i--;
				break;
			}
		}
		//没有容器坐标值大于鼠标的x，设为最后一个容器，都大于的话，设为第一个
		i = Math.max(0, i);
		i = Math.min(i, len - 1);
		var sp = this.split[i];
		len = sp.second.length;
		for(; j < len; j++) {
			if(sp.second[j] >= ne.pageY)
				break;
		}
		var sameContainer = this.lastContainer == sp.node[0];
		//设置上下限
		j = Math.max(0, j);
		j = Math.min(j, sameContainer ? len - 1 : len);
		if(sameContainer) {
			//改变位置后才会触发
			if(this.tempContainer != sp.node[0] || this.lastIndex != j) {
				cb.call(this);
			}
		}
		else {
			if((this.tempContainer == sp.node[0] && this.lastIndex != j) || this.tempContainer != sp.node[0]) {
				cb.call(this);
			}
		}
		function cb() {
			this.tempContainer = sp.node[0];
			this.lastIndex = this.tempIndex = j;
			if(this.options.realTime) {
				this._switch(node, sp.node, j);
			};
			this.trigger('drag:switch', [node, sp.node, j]);
		}
	}
	Klass.prototype._switch = function(node, container, i, last) {
		//switch为true时，drag:end时才执行的改变位置，优化校验是否改变了位置，未改变的话不进行插入操作
		if(last && container.children(this.options.drag).eq(i)[0] == node[0]) 
			return;
		//为0时在头部插入
		if(i == 0)
			container.prepend(node);
		//否则按照索引插入
		else {
			var siblings = [];
			container.children(this.options.drag).each(function(index, o) {
				if(o != node[0]) {
					siblings.push(o);
				}
			});
			var before = $(siblings[i - 1]);
			before.after(node);
		}
	}
	return Klass;
});