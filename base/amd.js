var require,
	define;

(function() {

	var toString = Object.prototype.toString,
		lib = {},
		script = {},
		fac = {},
		baseUrl = 'http://' + location.host + location.pathname,
		defQueue;

	function isString(o) {
        return toString.call(o) === "[object String]";
	}
	function isFunction(o) {
        return toString.call(o) === "[object Function]";
	}

	/**
	 * @public amd定义接口
	 * @param {boolean} 由自动构建工具打包合并而成一个文件时，非最后一个模块传参，特殊处理，不加入defQueue。编程时完全忽略这个参数
	 * @param {string} 由自动构建工具打包合并而成一个文件时，非最后一个模块传参，特殊处理，不加入defQueue。编程时完全忽略这个参数
	 * @param {string} 模块id，可选，省略为script文件url
	 * @param {array} 依赖模块id，可选
	 * @param {Function/object} 初始化工厂
	 */
	define = function(combo, url, id, dependencies, factory) {
		if(combo !== true) {
			factory = id;
			dependencies = url;
			id = combo;
		}
		if(!isString(id)) {
			factory = dependencies;
			dependencies = id;
			id = null;
		}
		if(!Array.isArray(dependencies)) {
			factory = dependencies;
			dependencies = null;
		}
		//在没有定义依赖的情况下，通过factory.toString()方式匹配正则，智能获取依赖列表
		if(!dependencies && isFunction(factory)) {
			var res = /(?:^|[^.])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g.exec(factory.toString().replace(/\/\/.*\n/g, ''));
			if(res) {
				dependencies = res.slice(2);
			}
		}
		var module = {
			id: id,
			dependencies: dependencies,
			factory: factory,
			exports: null,
			uri: null
		};
		//非匿名模块
		if(id)
			lib[id] = module;
		//构建打包的模块自动拥有id和uri属性
		if(combo === true) {
			lib[url] = module;
			module.id = module.id || url;
			module.uri = url;
		}
		//存入def队列
		else if(defQueue)
			defQueue.push(module);
		//记录factory和module的hash对应关系
		if(isFunction(factory))
			record(factory, module);
	}
	define.amd = { jQuery: true };
	function record(factory, mod) {
		var ts = genFacKey(factory);
		(fac[ts] = fac[ts] || []).push({
			f: factory,
			r: mod
		});
	}
	function genFacKey(factory) {
		return factory.toString().slice(0, 32);
	}
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 */
	function use(ids, cb) {
		defQueue = defQueue || []; //use之前的模块为手动添加在页面script标签的模块或合并在总库中的模块，它们需被排除在外
		var idList = isString(ids) ? [ids] : ids, wrap = function() {
			var keys = idList.map(function(v) {
				return lib[v] ? v : getAbsUrl(v);
			}), mods = [];
			keys.forEach(function(k) {
				var mod = getMod(k);
				if(!mod.exports) {
					var deps = [];
					mod.exports = {};
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
						deps = [require, mod.exports, mod];
					mod.exports = isFunction(mod.factory) ? (mod.factory.apply(null, deps) || mod.exports) : (mod.factory || {});
					delete mod.factory;
				}
				mods.push(mod.exports);
			});
			cb.apply(null, mods);
		}, recursion = function() {
			var urls = idList.map(function(v) {
				return lib[v] ? v : getAbsUrl(v);
			}), deps = [];
			urls.forEach(function(url) {
				var mod = getMod(url),
					d = mod.dependencies;
				checkCyclic(mod, {}, []);
				!mod.exports && d && d.forEach(function(id) {
					deps.push(lib[id] ? id : getAbsUrl(id, mod.uri));
				});
			});
			//如果有依赖，先加载依赖，否则直接回调
			if(deps.length) {
				use(deps, wrap);
			}
			else {
				wrap();
			}
		};
		if(isString(ids)) {
			if(lib[ids]) {
				recursion();
			}
			else {
				var url = getAbsUrl(ids);
				$$.load(url, function() {
					//必须判断重复，防止2个use线程加载同一个script同时触发2次callback
					if(!script[url]) {
						script[url] = true;
						var mod = defQueue.shift();
						mod.id = mod.id || url;
						mod.uri = url;
						lib[url] = mod;
					}
					recursion();
				});
			}
		}
		else {
			var remote = ids.length;
			ids.forEach(function(id) {
				use(id, function() {
					if(--remote == 0) {
						recursion();
					}
				});
			});
		}
	}
	/**
	 * private 检测循环依赖
	 * @param {object} 模块
	 * @param {hashmap} 历史记录
	 * @param {array} 依赖顺序
	 */
	function checkCyclic(mod, history, list) {
		if(!mod)
			return;
		var url = mod.uri;
		list.push(url);
		if(history[url]) {
			throw new Error('found cyclic dependencies:\n' + list.join('\n'));
		}
		history[url] = true;
		mod.dependencies && mod.dependencies.forEach(function(dep) {
			checkCyclic(lib[getAbsUrl(dep, url)], Object.create(history), Object.create(list));
		});
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
		if(!mod)
			throw new Error('module error: ' + s + ' is undefined');
		return mod;
	}
	/**
	 * 根据依赖script的url获取绝对路径
	 * @param {string} url 需要转换的url
	 * @param {string} 依赖的url
	 */
	function getAbsUrl(url, depend) {
		if(url.indexOf('http://') == 0)
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
		else if(url.indexOf('./') == 0) {
			return depend[0] + url.slice(2);
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
				ts = genFacKey(caller),
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
		exports: {},
		uri: null
	};
	lib['module'] = {
		id: 'module',
		dependencies: null,
		exports: {},
		uri: null
	};

	$$.use = function(ids, cb) {
		use(ids, cb);
	};
	$$.modMap = function(id) {
		return id ? lib[id] : lib;
	};
	$$.base = function(url) {
		if(url)
			baseUrl = url;
		return baseUrl;
	};

})();