var $$ = (function() {
	var lib = {},
		state = {},
		list = {},
		LOADING = 1,
		LOADED = 2,
		h = document.head || document.getElementsByTagName('head')[0];
	/**
	 * @public 设置script的url的映射关系，为版本自动化做准备
	 * @note url会类似xxx.8735.js形式，为版本控制发布工具产生，其中数字为版本号，将去除版本号的正确url对应到自身上
	 * @param {url} script的url
	 * @param {boolean} 是否强制覆盖
	 */
	function join(url, force) {
		var key = url.replace(/\.\d+\.js$/, '.js');
		if(force || !lib[key])
			lib[key] = url;
	}
	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 * @param {String} script编码，可省略
	 * @param {Boolean} 不缓存，每次必重新加载，可省略
	 */
	function load(url, cb, charset, noCache) {
		if(charset === true) {
			noCache = true;
			charset = null;
		}
		if(state[url] == LOADED) {
			cb();
		}
		else if(state[url] == LOADING) {
			list[url].push(cb);
		}
		else {
			state[url] = LOADING;
			list[url] = [cb];
			var s = document.createElement('script');
			s.async = true;
			if(charset)
				s.charset = charset;
			s.src = lib[url] || url;
			function ol() {
				//根据noCache参数决定是否缓存记录，noCache时，只在loading阶段缓存cb，loaded后清除
				state[url] = noCache ? null : LOADED;
				s.onload = s.onreadystatechange = null;
				list[url].forEach(function(cb) {
					cb();
				});
				list[url] = [];
			}
			if(s.addEventListener)
				s.onload = ol;
			else {
				s.onreadystatechange = function() {
					if(/loaded|complete/.test(this.readyState))
						ol();
				};
			}
			h.appendChild(s);
		}
	}
	/**
	 * @public 获取映射库
	 * @return {Object} hashmap
	 */
	function map() {
		return lib;
	}
	return {
		join: join,
		load: load,
		map: map,
		head: h
	}
})();