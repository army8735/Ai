(function() {

	var head = document.getElementsByTagName('head')[0];
	
	$$.mix({
		/**
		 * @public 异步加载js文件方法
		 * @param {string} js的url
		 * @param {object} 选项传入charset和callback
		 */
		getScript: function(url, op) {
			var s = document.createElement('script'),
				done = false;
			s.type = 'text/javascript';
			s.async = true; //for firefox3.6
			if($.isFunction(op)) {
				op = { callback: op };
			}
			op = op || {};
			if(op.charset) {
				s.charset = op.charset;
			}
			if(op.async) {
				s.async = op.async;
			}
			if(op.type) {
				s.type = op.type;
			}
			s.src = url;
			s.onload = s.onreadystatechange = function(){
				if (!done && (!this.readyState || ['loaded', 'complete'].indexOf(this.readyState) > -1)) {
					done = true;
					//防止ie内存泄漏
					s.onload = s.onreadystatechange = null;
					head.removeChild(s);
					if(op.callback) {
						op.callback();
					}
				}
			};
			head.appendChild(s);
		},

		/**
		 * @public 异步加载css文件方法
		 * @param {string} css的url
		 * @param {func} callback
		 */
		getCss: function(url, cb) {
			var that = this;
			$.ajax({
				url: url,
				success: function(data) {
					var s = document.createElement('style');
					s.type = 'text/css';
					//ie和其它要分开对待
					if(s.styleSheet) {
						s.styleSheet.cssText = data;
					}
					else {
						s.appendChild(document.createTextNode(data));
					}
					head.appendChild(s);
					if(cb) {
						cb();
					}
				}
			});
		},
		
		/**
		 * @public 对任意一个url发送GET请求，忽略返回的内容
		 * @note 主要用于发送统计请求
		 * @param {string} url是请求的地址
		 * @param {string} 可选param是url里的query参数，可以写成对象的形式，也可以用&连成字符串
		 */
		getRequest: function(url, params){
			var img = new Image();
			//阻止IE下的自动垃圾回收引起的请求未发出状况
			img.onload = function(){};
			img.src = !params ? url : [url, /\?/.test(url) ? '&' : '?', $.isString(params) ? params : $.param(params)].join('');
		},
		
		/**
		 * @public 打开url
		 * @param {string} 打开的地址
		 * @param {string} 新开或者指定窗口对象名称
		 */
		openURL: function(url, target) {
			//自动增加http://开头
			if(url.indexOf('http') != 0) {
				url = 'http://' + url
			}
			//ie和其它浏览器的区别
			if (!$.browser.msie) {
				if ('_blank' == target)
					window.open(url);
				else if (target)
					window[target.replace(/^_/, '')].location.href = url;
				else
					location.href = url;
			}
			else {
				var s = this.render('<a href="<%=url%>" target="<%=target%>"></a>', {
					url: url,
					target: target || '_self'
				});
				$(s).appendTo($(document.body)).click();
			}
		}
	});

})();