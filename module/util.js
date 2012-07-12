define(function() {
	var tplCache = {};

	return {
		/**
		 * @public 去掉数组里重复成员
		 * @note 支持所有成员类型，包括dom，对象，数组，布尔，null等，复合类型比较引用
		 */
		unique: function(array) {
			var res = [], complex = [], record = {}, it, tmp, id = 0,
				type = {
					'number': function(n) { return '_num' + n; },
					'string': function(n) { return n; },
					'boolean': function(n) { return '_boolean' + n; },
					'object': function(n) { if(n !== null) complex.push(n); return n === null ? '_null' : false; },
					'undefined': function(n) { return '_undefined'; }
				};
			array.forEach(function(item) {
				it = tmp = item;
				tmp = type[typeof it](it);
				if(!record[tmp] && tmp) {
					res.push(it);
					record[tmp] = true;
				}
			});
			//存在复合对象，使用indexOf比较引用
			if(complex.length) {
				var i = 0;
				while(i < complex.length) {
					it = complex[i];
					while((tmp = complex.lastIndexOf(it)) !== i) {
						complex.splice(tmp, 1);
					}
					i++;
				}
			}
			return res.concat(complex);
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
			if(!date) {
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
		params: function(url) {
			url = url || location.href;
			var params = {},
				result = url.match(/[^\s&?#=\/]+=[^\s&?#=]+/g);
			if(result){
				for(var i = 0, l = result.length; i < l; i++){
					var n = result[i].split("=");
					params[n[0]] = decodeURIComponent(n[1]);
				}
			}
			return params;
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
		}
	};
});