(function() {

	//补充jquery中一些遗漏的方法
	var toString = Object.prototype.toString;
	$.isUndefined = function(o) {
		return o === undefined;
	}
	$.isString = function(o) {
		return toString.call(o) === '[object String]';
	}
	$.isBoolean = function(o) {
		return toString.call(o) === '[object Boolean]';
	}
	$.isNumber = function(o) {
		return toString.call(o) === '[object Number]' && isFinite(o);
	}
	$.isObject = function(o) {
		return typeof o === 'object';
	}

	$.fn.extend({
		/**
		 * @public 组合键
		 * @param {array} 需侦听的组合键code
		 * @param {func} callback
		 */
		'comboKey': function(keyCodes, cb) {
			var length = keyCodes.length,
				count = 0,
				keyHash = {};
			//转换hash判断增快速度
			keyCodes.forEach(function(item) {
				keyHash[item] = 1;
			});
			//有callback为侦听，否则为移除
			if(cb) {
				this.bind('keydown', keyDown);
				this.bind('keyUp', keyUp);
			}
			else {
				this.unbind('keydown', keyDown);
				this.unbind('keyUp', keyUp);
			}
			//handler
			function keyDown(e) {
				if(keyHash[e.keyCode]) {
					if(++count == length) {
						cb();
					}
				}
			}
			function keyUp(e) {
				if(keyHash[e.keyCode]) {
					--count;
				}
			}
		}
	});

	$.cookie = function(name, value, options) {
		if(!$.isUndefined(value)) { // name and value given, set cookie
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

})();

var $$ = {
	/**
	 * @public 为parent指定的命名空间
	 * @param {string} 命名空间，如com.x.y.z，其中最后一位不包含在命名空间内，是对象名
	 * @param {object} 可选，写入到命名空间上的对象，为空此方法重载为读取对象
	 * @return {object} 返回被扩展的命名空间对象
	 */
	ns: function(namespace, target){
		var i,
			p = window,
			n = namespace.split('.').reverse(),
			temp = [];
		if($.isUndefined(target)) {
			while((i = n.pop()) && n.length) {
				p = p[i];
				temp.push(i);
				if(!$.isPlainObject(p)) {
					throw new Error('namespace: ' + namespace + ', ' + temp.join('.') + ': is not an object');
				}
			}
		}
		else {
			while((i = n.pop()) && n.length) {
				temp.push(i);
				if($.isUndefined(p[i])) {
					p[i] = {};
				}
				else if(!$.isPlainObject(p)) {
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
		var p = (ns ? this.ns('$$.' + ns, {}) : this);
		$.extend(p, object);
	},

	/**
	 * @public 取出一个对象中的所有key
	 */
	keys: function(obj) {
		var keys = [];
		obj = obj || {};
		for (var prop in obj) {
			if(obj.hasOwnProperty(prop)) {
				keys.push(prop);
			}
		}
		return keys;
	},

	/**
	 * @public 去掉数组里重复成员
	 * @note 支持所有成员类型，包括dom，对象，数组，布尔，null等，复合类型比较引用
	 */
	unique: function(array) {
		var res = [], complex = [], record = {}, it, tmp, id = 0,
			type = {
				'number': function(n) { return '_num' + n; },
				'string': function(n) { return n; },
				'boolean': function(n) { return '_boolean' + n; },
				'object': function(n) { if(n !== null) complex.push(n); return n === null ? '_null' : false; },
				'undefined': function(n) { return '_undefined'; }
			};
		array.forEach(function(item) {
			it = tmp = item;
			tmp = type[typeof it](it);
			if(!record[tmp] && tmp) {
				res.push(it);
				record[tmp] = true;
			}
		});
		//存在复合对象，使用indexOf比较引用
		if(complex.length) {
			var i = 0;
			while(i < complex.length) {
				it = complex[i];
				while((tmp = complex.lastIndexOf(it)) !== i) {
					complex.splice(tmp, 1);
				}
				i++;
			}
		}
		return res.concat(complex);
	}
};