(function() {

	//补充ECMAScript5里的方法, 除ie外都有native实现
	var arrayMethod = Array.prototype;
	if(!arrayMethod.filter) {
		arrayMethod.filter = function(fn, sc){
			var r = [];
			for(var i = 0, l = this.length; i < l; i++){
				if( (i in this) && fn.call(sc, this[i], i, this) )
					r.push(this[i]);
			}
			return r;
		};
	}
	if(!arrayMethod.forEach) {
		arrayMethod.forEach = function(fn, sc){
			for(var i = 0, l = this.length; i < l; i++){
				if (i in this)
					fn.call(sc, this[i], i, this);
			}
		};
	}
	if(!arrayMethod.map) {
		arrayMethod.map = function(fn, sc){
			for(var i = 0, copy = [], l = this.length; i < l; i++){
				if (i in this)
					copy[i] = fn.call(sc, this[i], i, this);
			}
			return copy;
		};
	}
	if(!arrayMethod.indexOf) {
		arrayMethod.indexOf = function(elt, from){
			var l = this.length;
			from = parseInt(from) || 0;
			if (from < 0)
				from += l;
			for (; from < l; from++) {
				if (from in this && this[from] === elt)
					return from;
			}
			return -1;
		};
	}
	if(!arrayMethod.lastIndexOf) {
		arrayMethod.lastIndexOf = function(elt, from){
			var l = this.length;
			from = parseInt(from) || l - 1;
			if (from < 0)
				from += l;
			for (; from > -1; from--) {
				if (from in this && this[from] === elt)
					return from;
			}
			return -1;
		};
	}
	if(!String.prototype.trim) {
		String.prototype.trim = function() {
			return $.trim(this);
		};
	}
	if(!Date.prototype.now) {
		Date.prototype.now = function() {
			return new Date();
		};
	}

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