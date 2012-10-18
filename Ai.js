(function() {

	//补充ECMAScript5里的方法
	var arrayMethod = Array.prototype;
	if(!arrayMethod.filter) {
		arrayMethod.filter = function(fn, sc){
			var r = [], val;
			for(var i = 0, l = this.length >>> 0; i < l; i++) {
				if(i in this) {
					val = this[i];
					if(fn.call(sc, val, i, this)) {
						r.push(val);
					}
				}
			}
			return r;
		};
	}
	if(!arrayMethod.forEach) {
		arrayMethod.forEach = function(fn, sc){
			for(var i = 0, l = this.length >>> 0; i < l; i++){
				if (i in this)
					fn.call(sc, this[i], i, this);
			}
		};
	}
	if(!arrayMethod.map) {
		arrayMethod.map = function(fn, sc){
			for(var i = 0, copy = [], l = this.length >>> 0; i < l; i++){
				if (i in this)
					copy[i] = fn.call(sc, this[i], i, this);
			}
			return copy;
		};
	}
	if(!arrayMethod.indexOf) {
		arrayMethod.indexOf = function(value, from){
			var len = this.length >>> 0;

			from = Number(from) || 0;
			from = Math[from < 0 ? 'ceil' : 'floor'](from);
			if(from < 0) {
				from = Math.max(from + len, 0);
			}

			for(; from < len; from++) {
				if(from in this && this[from] === value) {
					return from;
				}
			}

			return -1;
		};
	}
	if(!arrayMethod.every) {
		arrayMethod.every = function(fn, context) {
			for(var i = 0, len = this.length >>> 0; i < len; i++) {
				if(i in this && !fn.call(context, this[i], i, this)) {
					return false;
				}
			}
			return true;
		}
	}
	if(!arrayMethod.some) {
		arrayMethod.some = function(fn, context) {
			for(var i = 0, len = this.length >>> 0; i < len; i++) {
				if(i in this && fn.call(context, this[i], i, this)) {
					return true;
				}
			}
			return false;
		}
	}
	if(!arrayMethod.reduce) {
		arrayMethod.reduce = function (fn /*, initial*/) {
			var len = this.length >>> 0, i = 0, result;

			if(arguments.length > 1) {
				result = arguments[1];
			}
			else {
				do {
					if(i in this) {
						result = this[i++];
						break;
					}
					// if array contains no values, no initial value to return
					if(++i >= len) {
						throw new TypeError('reduce of empty array with on initial value');
					}
				}
				while(true);
			}

			for(; i < len; i++) {
				if (i in this) {
					result = fn.call(null, result, this[i], i, this);
				}
			}

			return result;
		}
	}
	if(!String.prototype.trim) {
		String.prototype.trim = function() {
			return String(this).replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}
	Array.isArray || (Array.isArray = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	});
	Date.now || (Date.now = function () {
		return +new Date;
	});
	Object.keys || (Object.keys = function(o) {
		var ret=[],p;
		for(p in o)
			if(Object.prototype.hasOwnProperty.call(o,p))
				ret.push(p);
		return ret;
	});
	Object.create || (Object.create = function (o) {
		function F() {}
		F.prototype = o;
		return new F();
	});
	Function.prototype.bind || (Function.prototype.bind = function(oThis) {
		var fSlice = Array.prototype.slice,
			aArgs = fSlice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
									 ? this
									 : oThis || window,
									 aArgs.concat(fSlice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	});

})();var $$ = (function() {
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
})();var require,
	define;

(function() {

	var toString = Object.prototype.toString,
		lib = {},
		relation = {},
		finishUrl,
		defQueue,
		delayCount = 0,
		delayQueue = [],
		interactive = document.attachEvent && !window['opera'];

	function isString(o) {
        return toString.call(o) == '[object String]';
	}
	function isFunction(o) {
        return toString.call(o) == '[object Function]';
	}

	/**
	 * @public amd定义接口
	 * @param {string} 模块id，可选，省略为script文件url
	 * @param {array} 依赖模块id，可选
	 * @param {Function/object} 初始化工厂
	 */
	define = function(id, dependencies, factory) {
		if(arguments.length == 1) {
			factory = id;
			id = dependencies = null;
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
		dependencies = dependencies || [];
		//另外一种依赖写法，通过factory.toString()方式匹配正则，智能获取依赖列表
		if(isFunction(factory)) {
			var res = /(?:^|[^.])\brequire\s*(?:\.async\s*)?\(\s*(["'])([^"'\s\)]+)\1\s*\)/g.exec(factory.toString());
			if(res)
				dependencies = dependencies.concat(res.slice(2));
		}
		var module = {
			id: id,
			dependencies: dependencies,
			factory: factory
		};
		//具名模块
		if(id)
			lib[id] = module;
		//记录factory和module的hash对应关系
		if(isFunction(factory))
			record(factory, module);
		//构建工具合并的模块先声明了url，可以直接跳过以后所有逻辑
		if(finishUrl) {
			fetch(module, finishUrl);
			return;
		}
		//ie下利用interactive特性降低并发情况下非一致性错误几率
		if(interactive) {
			var s = $$.head.getElementsByTagName('script'),
				i = 0,
				len = s.length;
			for(; i < len; i++) {
				if(s[i].readyState == 'interactive') {
					fetch(module, s[i].hasAttribute ? s[i].src : s[i].getAttribute('src', 4));
					return;
				}
			}
		}
		//走正常逻辑，存入def队列
		if(defQueue)
			defQueue.push(module);
		finishUrl = null;
	}
	define.amd = { jQuery: true };
	define.url = function(url) {
		finishUrl = getAbsUrl(url);
	}
	function fetch(mod, url) {
		mod.uri = url;
		lib[url] = mod;
		finishUrl = null;
	}
	function record(factory, mod, callee) {
		var ts = getFunKey(factory);
		(relation[ts] = relation[ts] || []).push({
			f: factory,
			m: mod
		});
	}
	function getFunKey(factory) {
		return factory.toString().slice(0, 32);
	}
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 * @param {string} 模块的强制编码，可省略
	 */
	function use(ids, cb, charset) {
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
				//尚未初始化的模块检测循环依赖和统计依赖
				if(!mod.exports) {
					checkCyclic(mod, {}, []);
					d && d.forEach(function(id) {
						deps.push(lib[id] ? id : getAbsUrl(id, mod.uri));
					});
				}
			});
			//如果有依赖，先加载依赖，否则直接回调
			if(deps.length)
				use(deps, wrap, charset);
			else
				wrap();
		};
		if(isString(ids)) {
			var url = getAbsUrl(ids);
			if(lib[ids] || lib[url])
				recursion();
			else {
				$$.load(url, function() {
					//延迟模式下onload先于exec，进行2次幂延迟算法等待
					if(delayQueue.length)
						delayQueue.push(cb);
					else
						cb();
					function cb() {
						//必须判断重复，防止2个use线程加载同一个script同时触发2次callback
						if(!lib[url]) {
							if(defQueue.length) {
								var mod = defQueue.shift();
								fetch(mod, url);
							}
							else {
								d2();
								return;
							}
						}
						recursion();
						//如果还在延迟排队，执行延迟队列
						if(delayQueue.length)
							delayQueue.shift()();
					}
					function d2() {
						//等待到defQueue中有了的时候即可停止延迟，另外当lib[url]有了的时候也可以，因为可能是打包合并的模块文件onload抢先了，此时合并的文件的模块没有存入defQueue，但在define.finish中传入url存入了lib[url]
						if(defQueue.length || lib[url]) {
							delayCount = 0;
							cb();
							if(delayQueue.length)
								delayQueue.shift()();
						}
						else {
							if(delayCount > 5) {
								//这里可能有极低几率不准确，因为ie情况下define没进队列但得到了url属性，因此判断模块是否存在并执行；理论上倘若define还没执行但模块有老的，会出错
								if(lib[url]) {
									delayCount = 0;
									recursion();
									if(delayQueue.length)
										delayQueue.shift()();
									return;
								}
								throw new Error('2^ delay is too long to wait:\n' + url);
							}
							setTimeout(d2, Math.pow(2, delayCount++) << 4); //2 ^ n * 16的时间等比累加
						}
					}
				}, charset);
			}
		}
		else {
			var remote = ids.length;
			ids.forEach(function(id) {
				use(id, function() {
					if(--remote == 0)
						recursion();
				}, charset);
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
		var id = mod.uri;
		list.push(id);
		if(history[id])
			throw new Error('cyclic dependencies:\n' + list.join('\n'));
		history[id] = true;
		mod.dependencies && mod.dependencies.forEach(function(dep) {
			checkCyclic(lib[dep] || lib[getAbsUrl(dep, mod.uri)], Object.create(history), Object.create(list));
		});
	}
	/**
	 * private 根据传入的id或url获取模块
	 * @param {string} 模块id或url
	 */
	function getMod(s) {
		var mod = lib[s];
		if(!mod)
			throw new Error('module undefined:\n' + s);
		return mod;
	}
	/**
	 * 根据依赖script的url获取绝对路径
	 * @param {string} url 需要转换的url
	 * @param {string} 依赖的url
	 */
	function getAbsUrl(url, depend) {
		//自动末尾补加.js
		if(!/\.\w+$/.test(url))
			url += '.js';
		if(url.charAt(0) == '/')
			depend = $$.base();
		return $$.path(url, depend);
	}
	//默认的require虚拟模块
	require = function(id) {
		if(arguments.length == 1) {
			if(lib[id])
				return lib[id].exports;
			var caller = arguments.callee.caller,
				ts = getFunKey(caller),
				mod;
			relation[ts].forEach(function(o) {
				if(caller == o.f)
					mod = o.m;
			});
			return getMod(getAbsUrl(id, mod.uri)).exports;
		}
		else
			use.apply(null, Array.prototype.slice.call(arguments));
	};
	require.async = require;

	define('require', require);
	//exports和module
	define('exports', {});
	define('module', {});

	$$.mod = function(id) {
		return id ? lib[id] : lib;
	};

})();