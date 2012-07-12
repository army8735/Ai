define('Class', function() {
	function inheritPrototype(subType, superType) {
		var prototype = Object.create(superType.prototype);
		prototype.constructor = subType;
		subType.prototype = prototype;
	}
	function wrap(fn) {
		fn.extend = function(sub) {
			inheritPrototype(sub, fn);
			return wrap(sub);
		}
		fn.methods = function(o) {
			Object.keys(o).forEach(function(k) {
				fn.prototype[k] = o[k];
			});
			return fn;
		};
		fn.statics = function(o) {
			Object.keys(o).forEach(function(k) {
				fn[k] = o[k];
			});
			return fn;
		};
		fn.prototype.entry = function(k, v) {
			if(v === undefined)
				return this[k];
			else
				return this[k] = v;
		};
		fn.prototype.init = function() {
			var args = 
		};
		return fn;
	}
	function klass(cons) {
		return wrap(cons);
	}
	klass.extend = inheritPrototype;
	return klass;
});