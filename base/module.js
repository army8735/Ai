(function() {
	
	var	module = {}, //模块库，用以类似YUI.use异步加载模块或模块集
		action = {}, //管理action，用以多个页面共享一个js时执行里面的独立任务
		head = document.getElementsByTagName('head')[0],
		LOADING = 1,
		LOADED = 2,
		ORDER = !($.browser.opera || $.browser.mozilla); //不支持script/cache但是自动以script标签插入顺序串行异步执行代码的浏览器有opera和firefox

	//递归遍历模块依赖的模块列表，并返回
	function scanModule(mod, list){
		list = list || [];
		//历史记录确保list中出现的依赖模块只出现一次
		var history = list.history;
		if(!history) {
			history = list.history = {};
		}
		var deps;
		//直接传入array说明是模块集列表
		if($.isArray(mod)) {
			deps = mod;
		}
		//传入string说明是模块名
		else if($.isString(mod)) {
			mod = module[mod];
			//不存在抛异常
			if(!mod) {
				throw new Error(mod.name + ' is Undefined');
			}
			deps = mod.deps;
		}
		//object则是模块对象
		else if($.isObject(mod)) {
			deps = mod.deps;
		}
		//遍历并递归依赖集，记录在唯一的list引用上。css不支持依赖
		if(!mod.css && deps) {
			deps.forEach(function(dep) {
				dep = module[dep];
				if(dep && !history[dep.name]) {
					history[dep.name] = 1;
					scanModule(dep, list);
				}
			});
		}
		//将尚未加载的模块的url存入list，并置历史记录防止重复
		if(mod.url && mod.load != LOADED) {
			list.push(mod);
		}
		history[mod.name] = 1;
		return list;
	}
	function loadModule(mod, cb) {
		var url = mod.url;
		if(mod.css) {
			$$.getCss(url, function() {
				loadComplete.call(mod);
			});
		}
		else {
			if(ORDER && mod.deps) {
				mod.cache = 1;
			}
			$$.getScript(url, {
				charset: mod.charset,
				type: mod.cache ? 'script/cache' : null,
				callback: function() {
					loadComplete.call(mod);
				}
			});
		}
	}
	//仅仅是加载完成
	function loadComplete() {
		var self = this;
			remote = 0;
		//检查自己依赖的模块是否已经装载完成，没有的话尚不能执行，加入callback到没装载完成的模块中去，模拟休眠
		if(self.deps) {
			self.deps.forEach(function(dep) {
				dep = module[dep];
				if(dep.load != LOADED) {
					remote++;
					dep.cb.push(function() {
						if(--remote == 0) {
							loadFinish.call(self);
						}
					});
				}
			});
		}
		//所依赖的全部加载执行成功后可以直接调用
		if(!remote) {
			loadFinish.call(self);
		}
	}
	//加载完成并且依赖也加载执行完成
	function loadFinish() {
		var mod = this;
		//针对支持type为script/cache的浏览器，重新插入缓存的script标签使其生效
		if(mod.cache) {
			mod.cache = 0;
			$$.getScript(mod.url, {
				charset: mod.charset,
				callback: function() {
					loadFinish.call(mod);
				}
			});
		}
		else {
			mod.load = LOADED;
			mod.cb.forEach(function(cb) {
				cb();
			});
		}
	}
	//检测是否有循环依赖
	function checkRecursion(list) {
		var history = {},
			stack;
		//遍历需要异步加载的模块列表，每个模块深度遍历检测自己的依赖，出现过的说明此回路已检测过无需重复，记录在history中
		list.forEach(function(mod) {
			if(!history[mod.name]) {
				stack = [];
				history[mod.name] = 1;
				scanRecursion(mod, {});
			}
		});
		//每个模块深度遍历过程中，边记录边遍历，发现重复的说明出现循环回路，报异常
		function scanRecursion(mod, has) {
			if(mod && mod.deps) {
				stack.push(mod.name);
				mod.deps.forEach(function(dep) {
					if(has[dep]) {
						throw new Error('InfiniteLoop of dependence: ' + stack.join('->'));
					}
					has[dep] = 1;
					history[dep] = 1;
					scanRecursion(module[dep], has);
				});
				//自身完成后需清除
				has[mod.name] = 0;
				stack.pop();
			}
		}
	}

	$$.mix({
		/**
		 * @public 注册模块文件方法，模块可以是单独文件模块，亦可以是依赖于其它模块的模块集
		 * @param {string/object} 模块名，若为object则是以hash方式定义，key为模块名，后面3个数定义为一个数组
		 * @param {string/null} 模块的url，若无则设为null
		 * @param {array/string/boolean} 依赖的模块名，可以依赖多个。若为true则为定义css模块
		 * @param {stirng} 模块charset，可选
		 */
		def: function(name, url, deps, charset) {
			if($.isPlainObject(name)) {
				for(var i in name) {
					var args = name[i];
					this.def(i, args[0], args[1], args[2]);
				}
				return;
			}
			//不能覆盖已有模块
			if(module[name]) {
				throw new Error(name + ' has been defined');
			}
			var css;
			//单依赖转成数组
			if($.isString(deps) && deps.length) {
				deps = [deps];
			}
			else if(!$.isArray(deps) && !$.isUndefined(deps)) {
				css = true;
			}
			module[name] = {
				name: name,
				url: url && url.length ? url : null,
				deps: deps && deps.length ? deps : null,
				charset: charset,
				cb: [],
				css: css
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
				remote;
			//防止循环依赖造成死回路
			checkRecursion(list);
			cb = cb || function(){};
			//依赖先前已经加载完了直接执行
			if(len == 0) {
				cb();
			}
			//只依赖一个模块，加载callbak
			else if(len == 1) {
				remote = list[0];
				remote.cb.push(cb);
				if(!remote.load) {
					remote.load = LOADING;
					loadModule(remote);
				}
				else if(remote.load == LOADED) {
					cb();
				}
			}
			//依赖多个模块时，每个里面建立callback，并根据remote数量标识全部加载成功
			else {
				remote = list.length;
				list.forEach(function(mod) {
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
			function complete() {
				this.load = LOADED;
				if(--remote == 0) {
					cb();
				}
			}
		},

		/**
		 * @public 定义/执行action，和do无先后顺序
		 * @param {string} key
		 * @param {func} func
		 * @param {boolean} 是否覆盖掉已有的action，还是组合起来，默认false
		 */
		action: function(key, func, overwrite) {
			//未定义action或强制覆盖时，存入队列中等待do的调用
			if($.isUndefined(action[key]) || overwrite) {
				action[key] = {
					did: 0, //0标识尚未调用do，1是do过
					list: [func]
				};
			}
			else {
				//已定义则放入此action队列
				action[key].list.push(func);
				//倘若已经do过，直接执行
				if(action[key].did) {
					func();
				}
			}
		},
		
		/**
		 * @public 定义/执行action，和action无先后顺序
		 * @param {string/array/hash} 需要do的key，如果是array则是一组key，hash则是object的key
		 * @param {boolean} 如果已经do过，再次do是否重复此action列表，默认false
		 */
		does: function(key, repeat) {
			if($.isArray(key)) {
				key.forEach(function(item) {
					$$.does(item, repeat);
				});
			}
			else if($.isPlainObject(key)) {
				this.keys(key).forEach(function(item) {
					//hash配置的值必须为true时才会执行
					if(key[item]) {
						$$.does(item, repeat);
					}
				});
			}
			else {
				var act = action[key];
				//cancel掉了设为null，拥有最高优先级
				if(act === null) {
				}
				//调用时不存在队列说明还未声明action，将此action初始化并且did设为1，让action自动调用
				else if($.isUndefined(act)) {
					action[key] = {
						did: 1,
						list: []
					};
				}
				//已定义action或者强制执行时，遍历list
				else if(!act.did || repeat) {
					action[key].did = 1;
					act.list.forEach(function(fn) {
						fn();
					});
				}
			}
		},
		
		/**
		 * @public取消执行已定义的action，必须在定义的动作真正执行前执行，拥有最高优先级，取消后此动作永不执行
		 * @param {string/array/hash} 需要cancel的key，如果是array则是一组key，hash则是object的key
		 */
		cancel: function(key) {
			var list = [];
			if($.isArray(key)) {
				list = key;
			}
			else if($.isPlainObject(key)) {
				this.keys(key).forEach(function(item) {
					list.push(key);
				});
			}
			else {
				list.push(key);
			}
			//设为null使得后续中无论does还是action都不再执行
			list.forEach(function(item) {
				action[item] = null;
			});
		}
	});

})();