(function(){
	var tplCache = {};
	
	$$.mix({
		/**
		 * @public 生成随机整数
		 * @note 最小为0
		 * @param {number} min,max是随机数的范围，当只有一个参数时，min默认为0。当没有参数时，默认Math.random()的整数
		 * @return {int} 返回大于或等于0，小于范围的整数
		 */
		rand: function(min, max) {
			if($.isUndefined(min)) {
				return Math.floor(Math.random() * 100000000000000000);
			}
			else if($.isUndefined(max)) {
				max = min;
				min = 0;
			}
			return min + Math.floor(Math.random() * (max - min));
		},
	
		/**
		 * @public 取最大值
		 * @note 仅限数字
		 */
		max: function() {
			var args = arguments,
				i = args.length - 2,
				v = args[i + 1];
			for(; i > -1; i--) {
				if(args[i] > v) v = args[i];
			}
			return v;
		},
	
		/**
		 * @public 取最小值
		 * @note 仅限数字
		 */
		min: function() {
			var args = arguments,
				i = args.length - 2,
				v = args[i + 1];
			for(; i > -1; i--) {
				if(args[i] < v) v = args[i];
			}
			return v;
		},
		
		/**
		 * @public html转义
		 * @param {string} 需要转义的字符串
		 */
		escape: function(str){
			var xmlchar = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;',
				'{': '&#123;',
				'}': '&#125;',
				'@': '&#64;'
			};
			return str.replace(/[<>'"\{\}&@]/g, function($1){
				return xmlchar[$1];
			});
		},
		
		/**
		 * @public 取字符串的字节长度
		 * @param {string} 字符串
		 */
		byteLen: function(str) {
			return str.replace(/([^\x00-\xff])/g, '$1 ').length;
		},
	
		/**
		 * @public 按字节长度截取字符串
		 * @param {string} str是包含中英文的字符串
		 * @param {int} limit是长度限制（按英文字符的长度计算）
		 * @return {string} 返回截取后的字符串,默认末尾带有'...'
		 */
		substr: function(str, limit){
			var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
			return sub + '...';
		},
	
		/**
		 * @public 字符串是否以指定sub结尾
		 * @param {string} str需要确定的字符串
		 * @return {string} 结尾
		 */
		endsWith: function(str, sub){
			return str.lastIndexOf(sub) == str.length - sub.length;
		},
		
		/**
		 * @public 把文本复制到剪贴板
		 * @note 目前只支持ie
		 * @param {string} url是文本内容
		 * @param {func} succ是回调函数，参数是是否成功
		 */
		copyToClip : function(url, cb){
			cb = cb || function(){};
			if(window.clipboardData) {
				if(window.clipboardData.setData('text', url)) {
					cb(true);
				}
				else {
					cb(false);
				}
			}
			else {
				cb(false);
			}
		},
		
		/**
		 * @public 格式化日期
		 * @param {pattern} 格式化正则
		 * @param {date} 需格式化的日期对象
		 */
		formatDate: function(pattern, date) {
			function formatNumber(data, format) {
				format = format.length;
				data = data || 0;
				return format == 1 ? data : (data = String(Math.pow(10, format) + data)).substr(data.length - format);
			}
			if($.isUndefined(date)) {
				date = new Date();
			}
			else if($.isNumber(date)) {
				date = new Date();
				date.setTime(date);
			}
			return pattern.replace(/([YMDhsm])\1*/g, function(format) {
				switch(format.charAt()) {
					case 'Y':
						return formatNumber(date.getFullYear(), format);
					case 'M':
						return formatNumber(date.getMonth() + 1, format);
					case 'D':
						return formatNumber(date.getDate(), format);
					case 'w':
						return date.getDay() + 1;
					case 'h':
						return formatNumber(date.getHours(), format);
					case 'm':
						return formatNumber(date.getMinutes(), format);
					case 's':
						return formatNumber(date.getSeconds(), format);
				}
			});
		},

		/**
		 * @public 渲染模板方法
		 * @note 可以直接支持<elements id="id">tpl</elements>
		 * @note 模板中的变量格式：<%=variable%>
		 * @note <%%>中支持原生js代码，this为第2个参数对象
		 * @url http://ejohn.org/blog/javascript-micro-templating/
		 * @param {string/object} 模板或需要渲染的节点数据
		 * @param {Object} 需要渲染的数据
		 * @return {string} 渲染好的html字符串
		 */
		render: function tmpl(tpl, data){
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			var fn = !/\W/.test(tpl) ? tplCache[tpl] = tplCache[tpl] ||
				tmpl(document.getElementById(tpl).innerHTML) :
			  
				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					tpl
					  .replace(/[\r\t\n]/g, " ")
					  .split("<%").join("\t")
					  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
					  .replace(/\t=(.*?)%>/g, "',$1,'")
					  .split("\t").join("');")
					  .split("%>").join("p.push('")
					  .split("\r").join("\\'")
					+ "');}return p.join('');");
			
			// Provide some basic currying to the user
			return data ? fn(data) : fn;
		},

		/**
		 * @public 返回url的get变量，以hash模式
		 * @return {object} hash的变量
		 */
		pageParams: function() {
			var params = {};
			var result = /[^\s&\?#=\/]+=[^\s&\?#=]+/g.exec(location.href || '');
			if(result){
				for(var i = 0, l = result.length; i < l; i++){
					var n = result[i].split("=");
					params[n[0]] = decodeURIComponent(n[1]);
				}
			}
			return params;
		},

		/**
		 * @public 可并行加载script文件，且仅加载一次
		 * @param {url} script的url
		 * @param {Function} 回调
		 */
		loadScript: (function() {
			var state = {},
				list = {},
				UNLOAD = 0,
				LOADING = 1,
				LOADED = 2,
				h = $('head')[0];
			return function(url, cb) {
				if(!state[url]) {
					state[url] = UNLOAD;
					list[url] = [cb];
					var s = document.createElement('script'),
						done;
					s.type = 'text/javascript';
					s.async = true;
					s.src = url;
					s.onload = s.onreadystatechange = function() {
						if(!done && (!this.readyState || ['loaded', 'complete'].indexOf(this.readyState) != -1)) {
							done = 1;
							s.onload = s.onreadystatechange = null;
							//缓存记录
							state[url] = LOADED;
							list[url].forEach(function(cb) {
								cb();
							});
							list[url] = null;
							h.removeChild(s);
						}
					};
					h.appendChild(s);
				}
				else if(state[url] == LOADING) {
					list[url].push(cb);
				}
				else if(state[url] == LOADED) {
					cb();
				}
			};
		})()
	});
})();
