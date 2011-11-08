var $$ = {
	/**
	 * @public 寄生组合继承
	 */
	inheritPrototype: function(subType, superType) {
		var prototype = Object.create(superType.prototype);
		prototype.constructor = subType;
		subType.prototype = prototype;
	},

	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 */
	load: (function() {
		var state = {},
			list = {},
			LOADING = 1,
			LOADED = 2,
			h = document.getElementsByTagName('head')[0];
		return function(url, cb, charset) {
			if(state[url] == LOADED) {
				cb();
			}
			else if(state[url] == LOADING) {
				list[url].push(cb);
			}
			else {
				state[url] = LOADING;
				list[url] = [cb];
				var s = document.createElement('script'),
					done;
				s.type = 'text/javascript';
				s.async = true;
				if(charset)
					s.charset = charset;
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
						delete list[url];
						h.removeChild(s);
					}
				};
				h.appendChild(s);
			}
		};
	})()
};