(function() {

	var module = {},
		script = {},
		lastMod,
		cache = [];

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
		if($.isFunction(factory) && !dependencies) {
			var res = /\brequire\s*\(\s*['"]?([^'")]*)/g.exec(factory.toString().replace(/\/\/.*\n/g, '').replace(/\/\*(\s|.)*\*\//g, ''));
			if(res) {
				res.shift();
				dependencies = res.length ? res : null;
			}
		}
		lastMod = {
			id: id,
			dependencies: dependencies,
			factory: factory,
			uri: null
		};
		if(id) {
			if(module[id]) {
				throw new Error('module conflict: ' + lastMod.id + ' has already existed');
			}
			module[id] = {
				id: id,
				dependencies: dependencies,
				factory: factory,
				uri: null
			};
			lastMod = null;
			cache.push(module[id]);
		}
		else {
			lastMod = {
				id: null,
				dependencies: dependencies,
				factory: factory,
				uri: null
			};
		}
	}
	define.amd = {};
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 */
	function use(ids, cb) {
		if($.isString(ids)) {
			ids = [ids];
		}
		cb = cb || function() {};
		var wrap = function() {
				var mods = [];
				ids.forEach(function(id) {
					var mod = getMod(id);
					//默认的2个模块没有依赖且无需转化factory
					if($.isFunction(mod.factory) && ['require', 'exports', 'module'].indexOf(id) == -1) {
						var deps = [],
							exports = {};
						//有依赖参数为依赖的模块，否则默认为require, exports, module3个默认模块
						if(mod.dependencies) {
							mod.dependencies.forEach(function(d) {
								//使用exports模块用作导出
								if(d == 'exports') {
									deps.push(exports);
								}
								//使用module模块即为本身
								else if(d == 'module') {
									deps.push(mod);
								}
								else {
									deps.push(getMod(d).factory);
								}
							});
						}
						else {
							deps = [getMod('require').factory, exports, mod];
						}
						mod.factory = mod.factory.apply(null, deps) || exports;
						//重置exports，为下次模块使用exports初始化清空
						exports = {};
					}
					mods.push(mod.factory);
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
					use(deps, wrap);
				}
				else {
					wrap();
				}
			};
		//将id转换为url
		var urls = [];
		ids.forEach(function(o) {
			urls.push(id2Url(o));
		});
		loadScripts(urls, recursion);
	}
	/**
	 * private 将id转换为url，如果模块url不存在，那么id本身就是url
	 * @param {string} 模块id
	 */
	function id2Url(id) {
		if(module[id]) {
			return module[id].url;
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
		var remote = urls.length;
		if(remote) {
			urls.forEach(function(url) {
				$$.loadScript(url, function() {
					if(lastMod) {
						lastMod.id = lastMod.uri = url; //匿名module的id为本身script的url
						if(module[url]) {
							throw new Error('module conflict: ' + url + ' has already existed');
						}
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
		factory: function(id) {
			return getMod(id).factory;
		},
		uri: ''
	};
	module['exports'] = {
		id: 'exports',
		dependencies: null,
		factory: null,
		uri: ''
	};
	module['module'] = {
		id: 'module',
		dependencies: null,
		factory: null,
		uri: ''
	};

	window.define = define;
	$$.use = function(ids, cb) {
		use(ids, cb);
	};
	$$.modMap = function(id) {
		return id ? module[id] : module;
	};

})();