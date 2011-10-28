var require,
	exports,
	module;

(function() {

	var lib = {},
		script = {},
		fac = {},
		cache;

	/**
	 * @public amd定义接口
	 * @param {string} 模块id，可选，省略为script文件url
	 * @param {array} 依赖模块id，可选
	 * @param {Function/object} 初始化工厂
	 */
	function define(id, dependencies, factory) {
		if($.type(id) != 'string') {
			factory = dependencies;
			dependencies = id;
			id = null;
		}
		if(!$.isArray(dependencies)) {
			factory = dependencies;
			dependencies = null;
		}
		//在没有定义依赖的情况下，通过factory.toString()方式匹配正则，智能获取依赖列表
		if($.isFunction(factory) && !dependencies) {
			var res = /\brequire\s*\(\s*['"]?([^'")]*)/g.exec(factory.toString().replace(/\/\/.*\n/g, '').replace(/\/\*(\s|.)*\*\//g, ''));
			if(res) {
				res.shift();
				dependencies = res.length ? res : null;
			}
		}
		//先将uris设置为最后一个script，用作直接script标签的模块；其它方式加载的话uri会被覆盖为正确的
		var lastScript = $('script:last').attr('url') || location.href;
		if(lastScript.charAt(0) == '/')
			lastScript = location.host + lastScript;
		else if(!/^https?\:\/\//.test(lastScript))
			lastScript = location.href.replace(/[#?].*/, '').replace(/(.+\/).*/, '$1') + lastScript;
		//匿名模块或者是设定了id的
		if(id) {
			lib[id] = {
				id: id,
				dependencies: dependencies,
				factory: factory,
				exports: null,
				uri: lastScript
			};
			module = null;
			cache && cache.push(lib[id]);
			if($.isFunction(factory)) {
				var ts = factory.toString();
				(fac[ts] = fac[ts] || []).push({
					f: factory,
					r: lib[id]
				});
			}
		}
		else {
			module = {
				id: null,
				dependencies: dependencies,
				factory: factory,
				exports: null,
				uri: lastScript
			};
			if($.isFunction(factory)) {
				var ts = factory.toString();
				(fac[ts] = fac[ts] || []).push({
					f: factory,
					r: module
				});
			}
		}
	}
	define.amd = {};
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 * @param {HashMap} 加载历史
	 * @param {array} 加载成功后回调
	 */
	function use(ids, cb, history, list) {
		cache = cache || []; //use之前的模块为手动添加在页面script标签的模块，它们的uri为标签src或者location.href
		if($.type(ids) == 'string')
			ids = [ids];
		ids = ids.map(function(v) {
			return lib[v] ? v : getAbsUrl(v);
		});
		//循环引用的检测
		var key = ids.join(',');
		if(history[key]) {
			list.push(key);
			throw new Error('Cycle dependences: ' + list.join('->'));
		}
		history[key] = 1;
		list.push(key);

		cb = cb || function() {};
		var wrap = function() {
				var mods = [];
				ids.forEach(function(id) {
					var mod = module = getMod(id);
					//默认的3个模块没有依赖且无需转化factory
					if(!mod.exports && ['require', 'exports', 'module'].indexOf(id) == -1) {
						var deps = [];
						mod.exports = exports = {};
						//有依赖参数为依赖的模块，否则默认为require, exports, module3个默认模块
						if(mod.dependencies) {
							mod.dependencies.forEach(function(d) {
								//使用exports模块用作导出
								if(d == 'exports')
									deps.push(mod.exports);
								//使用module模块即为本身
								else if(d == 'module')
									deps.push(mod);
								else {
									var m = lib[d] || getMod(getAbsUrl(d, mod.uri));
									deps.push(m.exports);
								}
							});
						}
						else
							deps = [getMod('require').exports, mod.exports, mod];
						mod.exports = $.isFunction(mod.factory) ? (mod.factory.apply(null, deps) || mod.exports) : mod.factory;
						delete mod.factory;
					}
					mods.push(mod.exports);
				});
				cb.apply(null, mods);
			},
			recursion = function() {
				var deps = [];
				urls.forEach(function(url) {
					var mod = getMod(url),
						d = mod.dependencies;
					d && d.forEach(function(id) {
						deps.push(lib[id] ? id : getAbsUrl(id, mod.uri));
					});
				});
				//如果有依赖，先加载依赖，否则直接回调
				if(deps.length) {
					use(deps, wrap, history, list);
				}
				else {
					wrap();
				}
			};
		//过滤已存在id的模块
		var urls = ids.filter(function(v) {
			return !lib[v];
		});
		loadScripts(urls, recursion);
	}
	/**
	 * private 将id转换为url，如果模块url不存在，那么id本身就是url
	 * @param {string} 模块id
	 */
	function id2Url(id) {
		if(lib[id] && lib[id].uri)
			return lib[id].uri;
		return id;
	}
	/**
	 * private 根据传入的id或url获取模块
	 * @param {string} 模块id或url
	 */
	function getMod(s) {
		var mod = lib[s];
		//可能传入的是url而非id，转换下
		if(!mod && script[s])
			mod = lib[script[s]];
		if(!mod)
			throw new Error('module error: ' + s + ' is undefined');
		return mod;
	}
	/**
	 * private 并行加载多个script文件
	 * @param {string/array} url
	 * @param {Function} 加载成功后的回调
	 */
	function loadScripts(urls, cb) {
		if($.type(urls) == 'string')
			urls = [urls];
		var remote = urls.length;
		if(remote) {
			urls.forEach(function(url) {
				$$.load(url, function() {
					if(module) {
						module.id = module.uri = url; //匿名module的id为本身script的url
						lib[url] = module;
						script[url] = url;
					}
					else {
						cache.forEach(function(o) {
							o.uri = url;
							script[url] = o.id;
						});
					}
					cache = [];
					if(--remote == 0)
						cb();
				});
			});
		}
		else
			cb();
	}

	/**
	 * 根据依赖script的url获取绝对路径
	 * @param {string} url 需要转换的url
	 * @param {string} 依赖的url
	 */
	function getAbsUrl(url, depend) {
		if(url.indexOf('http://') == 0)
			return url;
		depend = depend || 'http://' + location.host + location.pathname;
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
		depend.pop();
		return depend.join('/') + '/' + url;
	}

	//默认的require、exports、module模块
	lib['require'] = {
		id: 'require',
		dependencies: null,
		exports: function(id) {
			if(lib[id])
				return lib[id].exports;
			var caller = arguments.callee.caller,
				ts = caller.toString(),
				mod;
			fac[ts] && fac[ts].forEach(function(o) {
				if(caller == o.f)
					mod = o.r;
			});
			return getMod(getAbsUrl(id, mod.uri)).exports;
		},
		uri: null
	};
	require = lib['require'].exports;
	lib['exports'] = {
		id: 'exports',
		dependencies: null,
		exports: null,
		uri: null
	};
	lib['module'] = {
		id: 'module',
		dependencies: null,
		exports: null,
		uri: null
	};

	window.define = define;
	$$.use = function(ids, cb) {
		use(ids, cb, {}, []);
	};
	$$.modMap = function(id) {
		return id ? lib[id] : lib;
	};

})();