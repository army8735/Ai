var $$ = (function() {
	var lib = {},
		state = {},
		list = {},
		LOADING = 1,
		LOADED = 2,
		h = document.getElementsByTagName('head')[0];
	/**
	 * @public 设置script的url的映射关系，为版本自动化做准备
	 * @note url会类似xxx.8735.js形式，为版本控制发布工具产生，其中数字为版本号，将去除版本号的正确url对应到自身上
	 * @param {url} script的url
	 */
	function join(url) {
		lib[url.replace(/\.\d+\.js$/, '.js')] = url;
	}
	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 * @param {String} script编码
	 */
	function load(url, cb, charset) {
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
				done; //done不能删，因为有极低几率移除侦听异步操作导致2次回调，用bool值可防止。
			s.async = true;
			if(charset)
				s.charset = charset;
			s.src = lib[url] || url;
			s.onload = s.onreadystatechange = function() {
				if(!done && (!this.readyState || ['loaded', 'complete'].indexOf(this.readyState) != -1)) {
					done = true;
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
		map: map
	}
})();