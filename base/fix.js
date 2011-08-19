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
	if(!arrayMethod.lastIndexOf) {
		arrayMethod.lastIndexOf = function(value, from){
			var len = this.length >>> 0;

			from = Number(from) || len - 1;
			from = Math[from < 0 ? 'ceil' : 'floor'](from);
			if(from < 0) {
				from += len;
			}
			from = Math.min(from, len - 1);

			for(; from >= 0; from--) {
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
				if (i in this && !fn.call(context, this[i], i, this)) {
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
		}
		return false;
	}
	if(!arrayMethod.reduce) {
		arrayMethod.reduce = function (fn /*, initial*/) {
			if(typeof fn !== 'function') {
				throw new TypeError(fn + ' is not an function');
			}

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
	if(!arrayMethod.reduceRight) {
		arrayMethod.reduceRight = function (fn /*, initial*/) {
			if(typeof fn !== 'function') {
				throw new TypeError(fn + ' is not an function');
			}

			var len = this.length >>> 0, i = len - 1, result;

			if(arguments.length > 1) {
				result = arguments[1];
			}
			else {
				do {
					if(i in this) {
						result = this[i--];
						break;
					}
					// if array contains no values, no initial value to return
					if(--i < 0)
					throw new TypeError('reduce of empty array with on initial value');
				}
				while(true);
			}

			for(; i >= 0; i--) {
				if(i in this) {
					result = fn.call(null, result, this[i], i, this);
				}
			}

			return result;
		}
	}
	if(!String.prototype.trim) {
		String.prototype.trim = function() {
			return $.trim(this);
		};
	}
	Array.isArray || (Array.isArray = function (obj) {
		return OP.toString.call(obj) === '[object Array]';
	});
	Date.now || (Date.now = function () {
		return new Date().getTime();
	});
	Object.keys || (Object.keys = (function () {
		var hasDontEnumBug = !{toString:''}.propertyIsEnumerable('toString'),
			DontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			DontEnumsLength = DontEnums.length;

		return function (o) {
			if (o !== Object(o)) {
				throw new TypeError(o + ' is not an object');
			}

			var result = [];

			for (var name in o) {
				if (hasOwnProperty.call(o, name)) {
					result.push(name);
				}
			}

			if (hasDontEnumBug) {
				for (var i = 0; i < DontEnumsLength; i++) {
					if (hasOwnProperty.call(o, DontEnums[i])) {
						result.push(DontEnums[i]);
					}
				}
			}

			return result;
		};
	})());

	//flash在ie下会更改title的bug
	if($.browser.msie) {
		var title = document.title;
		$(document).bind('mouseup', function(e) {
			var n = e.target.nodeName;
			if(({'EMBED': 1, 'OBJECT': 1})[n]) {
				document.title = title;
			}
		});
		//ie6缓存背景图
		if($.browser.version == '6.0') {
			document.execCommand('BackgroundImageCache', false, true);
		}
	}

})();