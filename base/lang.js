$.cookie = function(name, value, options) {
	if(value !== undefined) { // name and value given, set cookie
		options = options || {};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires && ($.isNumber(options.expires) || options.expires.toUTCString)) {
			var date;
			if ($.isNumber(options.expires)) {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		// CAUTION: Needed to parenthesize options.path and options.domain
		// in the following expressions, otherwise they evaluate to undefined
		// in the packed version for some reason...
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	}
	else { // only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = $.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
}

var $$ = {
	/**
	 * @public 为parent指定的命名空间
	 * @param {string} 命名空间，如com.x.y.z，其中最后一位不包含在命名空间内，是对象名
	 * @param {object} 可选，写入到命名空间上的对象，为空此方法重载为读取对象
	 * @param {object} 可选，仅写入时有用，写入时的顶级对象，为空为window
	 * @return {object} 返回被扩展的命名空间对象
	 */
	ns: function(namespace, target, parent){
		var i,
			p = parent || window,
			n = namespace.split('.').reverse(),
			temp = [];
		if(target === undefined) {
			while((i = n.pop()) && n.length) {
				p = p[i];
				temp.push(i);
				if($.type(p) != 'object') {
					throw new Error('namespace: ' + namespace + ', ' + temp.join('.') + ': is not an object');
				}
			}
		}
		else {
			while((i = n.pop()) && n.length) {
				temp.push(i);
				if(p[i] === undefined) {
					p[i] = {};
				}
				else if($.type(p) != 'object') {
					throw new Error('namespace: ' + namespace + ', ' + temp.join('.') + ': is not an object');
				}
				p = p[i];
			}
			p[i] = target;
		}
		return p[i];
	},

	/**
	 * @public 将参数中的对象扩展到本身上，$.extend的简写封装
	 * @param {object} 需扩展的对象
	 * @param {string} 需要扩展到本身的命名空间，忽略为本身
	 */
	mix: function(object, ns) {
		var p = (ns ? this.ns(ns, {}, this) : this);
		$.extend(p, object);
	},

	/**
	 * @public 寄生组合继承
	 */
	inheritPrototype: function(subType, superType) {
		var prototype = Object.create(superType.prototype);
		prototype.constructor = subType;
		subType.prototype = prototype;
	},

	/**
	 * @public EventDispatcher类
	 */
	Event: (function() {
		function Klass() {
			this._dispatcher = $({});
		}
		['unbind', 'trigger'].forEach(function(k){
			Klass.prototype[k] = function() {
				this._dispatcher[k].apply(this._dispatcher, Array.prototype.slice.call(arguments, 0));

			}
		});
		Klass.prototype.bind = function() {
			var self = this,
				args = Array.prototype.slice.call(arguments, 0),
				cb = args.pop();
				cb2 = function() {
					var as = Array.prototype.slice.call(arguments, 0);
					as.shift();
					cb.apply(self, as);
				};
				args.push(cb2);
			this._dispatcher.bind.apply(this._dispatcher, args);
		}
		Klass.extend = function() {
			Array.prototype.slice.call(arguments, 0).forEach(function(o) {
				var e = new Klass,
					mix = {};
				Object.keys(Klass.prototype).forEach(function(k) {
					mix[k] = function() {
						e[k].apply(e, Array.prototype.slice.call(arguments, 0));
					}
				});
				$.extend(o, mix);
			});
			return arguments[0];
		}
		return Klass;
	})(),

	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 */
	load: (function() {
		var state = {},
			list = {},
			LOADING = 1,
			LOADED = 2,
			h = $('head')[0];
		return function(url, cb, charset) {
			if(state[url] == LOADED) {
				cb();
			}
			else if(state[url] == LOADING) {
				list[url].push(cb);
			}
			else {
				charset = charset || 'gbk';
				state[url] = LOADING;
				list[url] = [cb];
				var s = document.createElement('script'),
					done;
				s.type = 'text/javascript';
				s.async = true;
				s.charset = charset;
				s.src = url;
				s.onload = s.onreadystatechange = function() {
					if(!done && (!this.readyState || ['loaded', 'complete'].indexOf(this.readyState) != -1)) {
						done = 1;
						s.onload = s.onreadystatechange = null;
						//缓存记录
						state[url] = LOADED;
						list[url].forEach(function(cb) {
							cb();
						});
						delete list[url];
						h.removeChild(s);
					}
				};
				h.appendChild(s);
			}
		};
	})()
};