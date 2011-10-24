(function() {

	var module = {},
		script = {},
		lastMod,
		cache;

	/**
	 * @public amd定义接口
	 * @param {string} 模块id，可选，省略为script文件url
	 * @param {array} 依赖模块id，可选
	 * @param {Function/object} 初始化工厂
	 */
	function define(id, dependencies, factory) {
		if(!$.isString(id)) {
			factory = dependencies;
			dependencies = id;
			id = null;
		}
		if(!$.isArray(dependencies)) {
			factory = dependencies;
			dependencies = null;
		}
		//在没有正则的情况下，通过factory.toString()方式匹配正则，智能获取依赖列表
		if($.isFunction(factory) && !dependencies) {
			var res = /\brequire\s*\(\s*['"]?([^'")]*)/g.exec(factory.toString().replace(/\/\/.*\n/g, '').replace(/\/\*(\s|.)*\*\//g, ''));
			if(res) {
				res.shift();
				dependencies = res.length ? res : null;
			}
		}
		//先将uris设置为最后一个script，用作直接script标签的模块；其它方式加载的话uri会被覆盖为正确的
		var lastScript = $('script:last').attr('url') || location.href;
		if(lastScript.charAt(0) == '/') {
			lastScript = location.host + lastScript;
		}
		else if(!/^https?\:\/\//.test(lastScript)) {
			lastScript = location.href.replace(/[#?].*/, '').replace(/(.+\/).*/, '$1') + lastScript;
		}
		if(id) {
			module[id] = {
				id: id,
				dependencies: dependencies,
				factory: factory,
				exports: null,
				uri: lastScript
			};
			lastMod = null;
			cache && cache.push(module[id]);
		}
		else {
			lastMod = {
				id: null,
				dependencies: dependencies,
				factory: factory,
				exports: null,
				uri: lastScript
			};
		}
	}
	define.amd = {};
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 */
	function use(ids, cb, history, list) {
		cache = cache || []; //use之前的模块为手动添加在页面script标签的模块，它们的uri为标签src或者location.href
		if($.isString(ids)) {
			ids = [ids];
		}
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
					var mod = getMod(id);
					//默认的3个模块没有依赖且无需转化factory
					if(!mod.exports && ['require', 'exports', 'module'].indexOf(id) == -1) {
						var deps = [];
						mod.exports = {};
						//有依赖参数为依赖的模块，否则默认为require, exports, module3个默认模块
						if(mod.dependencies) {
							mod.dependencies.forEach(function(d) {
								//使用exports模块用作导出
								if(d == 'exports') {
									deps.push(module.exports);
								}
								//使用module模块即为本身
								else if(d == 'module') {
									deps.push(mod);
								}
								else {
									deps.push(getMod(d).exports);
								}
							});
						}
						else {
							deps = [getMod('require').exports, mod.exports, mod];
						}
						$.extend(mod.exports, $.isFunction(mod.factory) ? (mod.factory.apply(null, deps) || mod.exports) : mod.factory);
						delete mod.factory;
					}
					mods.push(mod.exports);
				});
				cb.apply(null, mods);
			},
			recursion = function() {
				var deps = [];
				ids.forEach(function(id) {
					var mod = getMod(id),
						d = mod.dependencies;
					if(d && d.length) {
						deps = deps.concat(d);
					}
				});
				//如果有依赖，先加载依赖，否则直接回调
				if(deps.length) {
					use(deps, wrap, history, list);
				}
				else {
					wrap();
				}
			};
		//将id转换为url
		var urls = [];
		ids.forEach(function(o) {
			//模块以及存在说明加载过了
			if(module[o]) {
				return;
			}
			urls.push(id2Url(o));
		});
		loadScripts(urls, recursion);
	}
	/**
	 * private 将id转换为url，如果模块url不存在，那么id本身就是url
	 * @param {string} 模块id
	 */
	function id2Url(id) {
		if(module[id] && module[id].uri) {
			return module[id].uri;
		}
		return id;
	}
	/**
	 * private 根据传入的id或url获取模块
	 * @param {string} 模块id或url
	 */
	function getMod(s) {
		var mod = module[s];
		//可能传入的是url而非id，转换下
		if(!mod && script[s]) {
			mod = module[script[s]];
		}
		if(!mod) {
			throw new Error('module error: ' + s + ' is undefined');
		}
		return mod;
	}
	/**
	 * private 并行加载多个script文件
	 * @param {string/array} url
	 * @param {Function} 加载成功后的回调
	 */
	function loadScripts(urls, cb) {
		if($.isString(urls)) {
			urls = [urls];
		}
		urls = $$.unique(urls);
		var remote = urls.length;
		if(remote) {
			urls.forEach(function(url) {
				$$.loadScript(url, function() {
					if(lastMod) {
						lastMod.id = lastMod.uri = url; //匿名module的id为本身script的url
						module[url] = lastMod;
						script[url] = url;
					}
					else {
						cache.forEach(function(o) {
							o.uri = url;
							script[url] = o.id;
						});
					}
					cache = [];
					if(--remote == 0) {
						cb();
					}
				});
			});
		}
		else {
			cb();
		}
	}

	//默认的require、exports、module模块
	module['require'] = {
		id: 'require',
		dependencies: null,
		exports: function(id) {
			return getMod(id).exports;
		},
		uri: null
	};
	module['exports'] = {
		id: 'exports',
		dependencies: null,
		exports: null,
		uri: null
	};
	module['module'] = {
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
		return id ? module[id] : module;
	};

})();