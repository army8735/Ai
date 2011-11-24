define((function() {
	
	var win = $(window),
		height = win.height();

	return {
		/**
		 * @public 当滚动条拖动到对应节点显现时才进行加载
		 * @param {string/node} 延迟加载的节点或id
		 * @param {function} cb加载的回调函数
		 * @param {int} 临界值，离临界点尚有多远时提前执行回调，可选默认为0
		 */
		scrollLoad: function(node, cb, threshold) {
			if($.isString(node)) {
				node = $(node.charAt(0) == '#' ? node : '#' + node);
			}
			else {
				node = $(node);
			}
			if(!node[0]) {
				return;
			}
			threshold = threshold || 0;
			win.bind('scroll', onScroll);
			win.bind('resize', onResize);
			onScroll();
			function onScroll() {
				if(node.offset().top <= (win.scrollTop() + height + threshold)) {
					cb();
					win.unbind('scroll', onScroll);
					win.unbind('resize', onResize);
				}
			}
			function onResize() {
				height = win.height();
				onScroll();
			}
		},

		/**
		 * @public 当滚动条拖动到多高时才进行的图片延迟加载
		 * @param {jq} 需要延迟加载的图片（jq对象）
		 * @param {string} 图片的真实src路径写在本身的什么属性上面
		 * @param {int} 临界值，离临界点尚有多远时提前执行回调，可选默认为0
		 * @param {dom} 包含延迟图片的容器,jq对象，默认为document.body
		 */
		imgLoad: function(img, attr, threshold, container) {
			threshold = threshold || 0;
			container = container || $(document.body);
			//取得所有符合class命名规则的img
			var imgLib = {},
				imgList = [],
				key,
				top;
			//遍历它们，将具有相同scrollTop值的图片存在一组作为value，key为scrollTop值，再放入lib
			//再将所有出现的scrollTop值存入一个list，以空间换时间
			img.each(function(index, item) {
				item = $(item);
				key = item.attr(attr);
				if(key) {
					top = Math.floor(item.offset().top);
					if(imgLib[top]) {
						imgLib[top].push(item);
					}
					else {
						imgLib[top] = [item];
						imgList.push(top);
					}
				}
			});
			//将list从小到大排序
			imgList.sort(function(a, b) {
				return a - b;
			});
			win.bind('scroll', onScroll);
			win.bind('resize', onResize);
			onScroll();
			function onScroll() {
				if(imgList.length) {
					top = win.scrollTop() + height + threshold;
					for(var i = 0, len = imgList.length; i < len; i++) {
						if(imgList[i] <= top) {
							imgLib[imgList[i]].forEach(function(item) {
								item = $(item);
								item.attr('src', item.attr(attr));
							});
							//加载完后清除lib
							delete imgLib[imgList[i]];
						}
						else {
							break;
						}
					}
					//完成后清除相应记录的list
					imgList.splice(0, i);
				}
				else {
					win.unbind('scroll', onScroll);
					win.unbind('resize', onResize);
				}
			}
			function onResize() {
				height = win.height();
				onScroll();
			}
		}
	};

})());