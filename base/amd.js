(function() {

	var module = {},
		urlScript = {},
		lastId,
		lastDeps,
		lastFactory,
		lastUri,
		lastMod,
		UNLOAD = 0,
		LOADING = 1,
		LOADED = 2;

	function define(id, dependencies, factory) {
		//前2个参数可省略
		if(!$.isString(id)) {
			factory = dependencies;
			dependencies = id;
			id = null; //省略id时默认为加载js文件的绝对路径
		}
		if(!$.isArray(dependencies)) {
			factory = dependencies;
			dependencies = null;
		}
		lastId = id;
		lastDeps = dependencies;
		lastFactory = factory;window.t = window. t || 1;console.log('d' + window.t++);
		if(id) {
			lastMod = module[id] = {
				id: id,
				deps: dependencies,
				factory: factory
			};
		}
	};
	define.amd = {};
	function use(ids, cb) {
		if($.isString(ids)) ids = [ids];
		cb = cb || function(){};
		var urls = [];
		ids.forEach(function(id) {
			if(module[id]) urls.push(module[id].uri);
			else urls.push(getAbsUrl(id));
		});
		load(urls, function() {
			var mods = urls2Mods(urls),
				deps = [];
			mods.forEach(function(mod) {
				if(mod.deps) {
					mod.deps.forEach(function(item) {
						deps.push(item);
					});
				}
			});
			if(deps.length) {
				use(deps, function() {
					cb.apply(null, getModsFactories(urls2Mods(urls)));
				});
			}
			else cb.apply(null, getModsFactories(urls2Mods(urls)));
		});
	};

	function getAbsUrl(url) {
		if(/^https?:\/\//.test(url)) return url; //绝对路径
		if(url.charAt(0) == '/') return location.host + url; //相对根路径
		var uri = /^https?:\/\/(.+)\/[^/]*/.exec(location.href)[1];
		//相对路径
		if(url.charAt(0) == '.') {
			//todo
		}
		//完整前缀+文件名
		return 'http://' + uri + '/' + url;
	};

	function load(urls, cb) {
		if($.isString(urls)) urls = [urls];
		var loads = [];
		urls.forEach(function(url) {
			url = getAbsUrl(url);
			var script = urlScript[url];
			if(!script) script = urlScript[url] = {};
			if(script.state != LOADED) loads.push(url);
		});
		var remote = loads.length;
		if(remote == 0) cb();
		else {
			loads.forEach(function(url) {
				var script = urlScript[url];
				if(script && script.state == LOADING) script.cb.push(function() {
					complete.call(script);
				});
				else {
					urlScript[url] = {
						state: LOADING,
						cb: [function() {
							complete.call(this);
						}]
					};
					getScript(url);
				}
			});
		}
		function complete() {
			this.state = LOADED;
			if(--remote == 0) {
				cb();
			}
		}
	};
	function getScript(url) {
		$.ajax({
			url: url,
			dataType: 'script',
			cache: true,
			success: function() {
				if(lastId) {
					lastMod.uri = url;
				}
				else {
					module[url] = {
						id: url,
						uri: url,
						deps: lastDeps,
						factory: lastFactory
					};
				}
				/*lastId = lastId || url;console.log('---' + lastId);
				module[lastId] = {
					id: lastId,
					uri: url,
					deps: lastDeps,
					factory: lastFactory
				};*/
				var script = urlScript[url];
				script.state = LOADED;
				script.id = lastId;
				script.cb.forEach(function(cb) {
					cb();
				});
				script.cb = [];window.t = window. t || 1;console.log('s' + window.t++);
			}
		});
	};

	function url2Mod(url) {
		return module[urlScript[url].id];
	};
	function urls2Mods(urls) {
		var mods = [];
		urls.forEach(function(url) {
			mods.push(url2Mod(url));
		});
		return mods;
	};
	function getModFactory(mod) {
		var factory = mod.factory,
			deps = [];
		if($.isFunction(factory)) {
			if(mod.deps) {
				mod.deps.forEach(function(item) {
					if(module[item]) deps.push(getModFactor(module[item]));
					else deps.push(getModFactory(url2Mod(getAbsUrl(item))));
				});
			}
			factory = mod.factory = factory.apply(null, deps);
		}
		return factory;
	};
	function getModsFactories(mods) {
		var factories = [];
		mods.forEach(function(mod) {
			factories.push(getModFactory(mod));
		});
		return factories;
	};

	window.define = define;
	$$.use = use;

})();