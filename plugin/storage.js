define('storage', (function() {

	function initStorage(url) {
		//跨域，需加载iframe，同时考虑iframe加载完成前多次调用的设置缓存问题
		if($.isString(url)) {
			//第一次初始化先缓存下来所有操作，待iframe加载成功再检查缓存执行
			var sets = [],
				gets = [],
				removes = [],
				cache = {
					setItem: function(k, v) {
						sets.push({
							k: k,
							v: v
						});
					},
					getItem: function(k, cb) {
						gets.push({
							k: k,
							cb: cb
						});
					},
					removeItem: function(k) {
						removes.push(k);
					}
				},
				iframe = '<iframe src="' + url + '" style="position:absolute;left:-9999px;width:0;height:0;visibility:hidden;"></iframe>';
			iframe = $(iframe).load(function() {
				//加载成功后执行缓存操作，再惰性覆盖原接口
				cache = init(this.contentWindow);
				sets.forEach(function(item) {
					cache.setItem(item.k, item.v);
				});
				gets.forEach(function(item) {
					cache.getItem(item.k, item.cb);
				});
				removes.forEach(function(item) {
					cache.removeItem(item);
				});
			});
			$(function() {
				iframe.appendTo($(document.body));
			});
			return cache;
		}
		//本域存储，直接传入window对象
		else {
			return init(url);
		}
	}
	function init(win) {
		//html5存储支持，ff3.5+、chrome、safari4+、ie8+支持
		if(win.localStorage) {
			init = initInHtml5;
		}
		//ff2自己实现的一套方案
		else if(win.globalStorage) {
			init = initInFF2;
		}
		//ie5+支持的私有方案，存储空间只有1M
		else if(win.ActiveXObject) {
			init = initInLowIe;
		}
		return init(win);
	}
	function initInHtml5(win) {
		var storage = {};
		storage.setItem = function(k, v){
			win.localStorage.setItem(k, v);
		};
		storage.getItem = function(k, cb){
			cb(win.localStorage.getItem(k));
		};
		storage.removeItem = function(k){
			win.localStorage.removeItem(k);
		};
		return storage;
	}
	function initInFF2(win) {
		var storage = {};
		storage.setItem = function(k, v){
			win.globalStorage[win.document.domain].setItem(k, v);
		};
		storage.getItem = function(k, cb){
			cb((win.globalStorage[win.document.domain].getItem(k) || {}).value);
		};
		storage.removeItem = function(k){
			win.globalStorage[win.document.domain].removeItem(k);
		};
		return storage;
	}
	function initInLowIe(win) {
		var storage = {},
			doc = win.document.documentElement;
		doc.addBehavior('#default#userdata');
		storage.setItem = function(n, v){
			doc.setAttribute('_', v);
			doc.save(n);
		};
		storage.getItem = function(n, cb){
			try {
				doc.load(n);
				cb(doc.getAttribute('_'));
			} catch (ex) {};
		};
		storage.removeItem = function(n){
			try {
				doc.load(n);
				doc.expires = (new Date(315532799000)).toUTCString();
				doc.save(n);
			} catch(e) {};
		};
		return storage;
	}

	return {
		/**
		 * @public 离线存储
		 * @param {string} 存储的key，支持跨域存储（key后增加@和url），需引入子域的iframe，并指定document.domain为页面的域
		 * @param {null/string/Function} 存储的值，重载：设为null为删除，string为设定，Function为读取。其中设为回调函数的目的是为了兼容跨域时的回调（加载iframe有延时存在），唯一参数为值，保持跨域与否接口也一致
		 */
		storage: (function() {
			//为不同域初始化不同的唯一存储实例，默认非跨域为default
			var hash = {};
			return function(k, v) {
				var stg,
					key = k.split('@'),
					url = key[1];
				k = key[0];
				//设置了url则为跨子域存储
				if(url) {
					url = url.indexOf('http') == 0 ? url : 'http://' + url;
					if(!hash[url]) {
						hash[url] = initStorage(url);
					}
					stg = hash[url];
				}
				else {
					if(!hash['default']) {
						hash['default'] = initStorage(window);
					}
					stg = hash['default'];
				}
				//overload
				if($.isFunction(v)) {
					stg.getItem(k, v);
				}
				else if(v === null) {
					stg.removeItem(k);
				}
				else {
					stg.setItem(k, v);
				}
			};
		})()
	};

})());