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
		if(url.indexOf('/') == 0)
			url = baseUrl + url;
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
		if(!noCache && state[url] == LOADED) {
			cb();
		}
		else if(!noCache && state[url] == LOADING) {
			list[url].push(cb);
		}
		else {
			//根据noCache缓存情况设置loading状态
			if(!noCache) {
				state[url] = LOADING;
				list[url] = [cb];
			}
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
				//根据noCache参数决定是否缓存记录
				if(!noCache) {
					list[url].forEach(function(cb) {
						cb();
					});
					list[url] = [];
				}
				else
					cb();
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
	function absUrl(url, depend) {
		if(/^https?:\/\//.test(url))
			return url;
		depend = depend || baseUrl;
		var host = /(http:\/\/[^/]+)\/?(.*)/.exec(depend);
		depend = host[2].split('/');
		depend.unshift(host[1]);
		if(url.charAt(0) == '/')
			return depend[0] + url;
		else if(url.indexOf('../') == 0) {
			depend.pop();
			while(url.indexOf('../') == 0) {
				url = url.slice(3);
				depend.pop();
			}
			return depend.join('/') + '/' + url;
		}
		else if(url.indexOf('./') == 0)
			url = url.slice(2);
		depend.pop();
		return depend.join('/') + '/' + url;
	}

	return {
		join: join,
		load: load,
		map: map,
		head: h,
		base: base,
		absUrl: absUrl
	}
})();