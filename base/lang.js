var $$ = (function() {
	var lib = {},
		state = {},
		list = {},
		LOADING = 1,
		LOADED = 2,
		h = document.head || document.getElementsByTagName('head')[0],
		baseUrl = location.href.replace(/\/[^/]*$/, '/');
	/**
	 * @public 设置script的url的映射关系，为版本自动化做准备
	 * @note url会类似xxx.8735.js形式，为版本控制发布工具产生，其中数字为版本号，将去除版本号的正确url对应到自身上
	 * @param {url} script的url
	 * @param {boolean} 是否强制覆盖
	 */
	function join(url, force) {
		//join时可能不是绝对路径而是相对根路径，由构建工具生成
		url = path(url);
		var key = url.replace(/_\d+\.js$/, '.js');
		if(force || !lib[key])
			lib[key] = url;
	}
	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 * @param {String} script编码，可省略
	 */
	function load(url, cb, charset) {
		cb = cb || function(){};
		url = path(url);
		if(state[url] == LOADED) {
			cb();
		}
		else if(state[url] == LOADING) {
			list[url].push(cb);
		}
		else {
			state[url] = LOADING;
			list[url] = [cb];
			//创建script
			var s = document.createElement('script');
			s.async = true;
			if(charset)
				s.charset = charset;
			//版本自动化
			s.src = lib[url] || url;
			function ol() {
				s.onload = s.onreadystatechange = null;
				state[url] = LOADED;
				list[url].forEach(function(cb) {
					cb();
				});
				list[url] = [];
				setTimeout(function() {
					h.removeChild(s);
				}, 1);
			}
			if(s.addEventListener)
				s.onload = s.onerror = ol;
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
	function map(url) {
		return url ? lib[url] : lib;
	}
	/**
	 * @public 读取/设置全局根路径
	 * @param {String} 设置的路径
	 * @return {String} 根路径
	 */
	function base(url) {
		if(url)
			baseUrl = url;
		return baseUrl;
	}
	/**
	 * @public 获取绝对路径
	 * @param {string} url 需要转换的url
	 * @param {string} 依赖的url
	 * @return {String} 转换的结果
	 */
	function path(url, depend) {
		if(/^https?:\/\//.test(url))
			return url;
		depend = depend || baseUrl;
		var temp = depend.slice(8).split('/');
		temp.pop();
		temp[0] = depend.slice(0, 8) + temp[0];
		if(url.charAt(0) == '/')
			return temp.join('/') + url;
		else if(url.indexOf('../') == 0) {
			while(url.indexOf('../') == 0) {
				url = url.slice(3);
				temp.pop();
			}
			return temp.join('/') + '/' + url;
		}
		else if(url.indexOf('./') == 0)
			url = url.slice(2);
		return temp.join('/') + '/' + url;
	}

	return {
		join: join,
		load: load,
		map: map,
		head: h,
		base: base,
		path: path
	}
})();