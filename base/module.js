(function() {
	
	var	module = {}, //模块库，用以类似YUI.use异步加载模块或模块集
		head = $('head')[0],
		UNLOAD = 0,
		LOADING = 1,
		LOADED = 2;

	//递归遍历模块依赖的模块列表，并返回
	function scanModule(mod, list, history){
		list = list || [];
		history = history || {};
		if($.isArray(mod)) {
			mod.forEach(function(item) {
				scanModule(item, list, history);
			});
		}
		else if(!history[mod]) {
			//不存在抛异常
			if(!module[mod]) {
				throw new Error('module[' + mod + '] is Undefined');
			}
			mod = module[mod];
			//将尚未加载的模块的url存入list，并置历史记录防止重复
			if(mod.url && mod.load != LOADED) {
				list.push(mod);
			}
			history[mod.name] = 1;
		}
		return list;
	}
	function loadModule(mod) {
		$.ajax({
			url: mod.url,
			dataType: 'script',
			cache: mod.options.cache,
			charset: mod.options.charset,
			success: function() {
				loadComplete.call(mod);
			}
		});
	}
	//加载完成
	function loadComplete() {
		var mod = this;
		mod.load = LOADED;
		mod.cb.forEach(function(cb) {
			cb();
		});
	}
	function scanRequires(name) {
		var res = [];
		if($.isString(name)) {
			name = [name];
		}
		name.forEach(function(item) {
			if(!module[item]) {
				throw new Error('module[' + mod + '] is Undefined');
			}
			res = res.concat(module[item].requires);
		});
		return res;
	}

	$$.mix({
		/**
		 * @public 注册模块文件方法，模块可以是单独文件模块，亦可以是依赖于其它模块的模块集
		 * @param {string} 模块名，唯一
		 * @param {string/null} 模块的url，若无则设为null
		 * @param {string/array} 可选参数，依赖的模块名
		 * @param {object} 可选参数
		 */
		def: function(name, url, requires, options) {
			if($.isObject(requires)) {
				options = requires;
				requires = [];
			}
			else if($.isString(requires)) {
				requires = [requires];
			}
			requires = requires || [];
			options = $.extend({
				cache: true
			}, options);
			module[name] = {
				name: name,
				url: url && url.length ? url : null,
				requires: requires,
				options: options,
				cb: [],
				load: UNLOAD
			};
		},

		/**
		 * @public 异步使用模块或模块集的方法
		 * @param {string/array} 模块（集）的名称
		 * @param {func} 加载成功后的调用函数
		 */
		use: function(name, cb) {
			var list = scanModule(name),
				len = list.length,
				requires = scanRequires(name),
				one;
			cb = cb || function(){};
			requires.length ? this.use(requires, exec) : exec();
			function exec() {
				//依赖先前已经加载完了直接执行
				if(len == 0) {
					cb();
				}
				//只使用一个模块，加载callbak
				else if(len == 1) {
					one = list[0];
					//先将callback放入回调列表，目的是当此模块为loading状态时不再进入下面分支判断
					one.cb.push(cb);
					//未读取模块时标识其为loading状态并读取
					if(one.load == UNLOAD) {
						one.load = LOADING;
						loadModule(one);
					}
					//已加载好的直接执行回调
					else if(one.load == LOADED) {
						cb();
					}
				}
				//使用多个模块时，每个里面建立callback，并根据剩余数量标识全部加载成功
				else {
					list.forEach(function(mod) {
						//逻辑类似上面只使用一个的情况
						mod.cb.push(function() {
							complete.call(mod);
						});
						if(!mod.load) {
							mod.load = LOADING;
							loadModule(mod);
						}
						else if(mod.load == LOADED) {
							complete.call(mod);
						}
					});
				}
			}
			function complete() {
				this.load = LOADED;
				if(--len == 0) {
					cb();
				}
			}
		}
	});

})();