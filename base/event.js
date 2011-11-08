/**
 * @public EventDispatcher¿‡
 */
$$.Event = (function() {
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
})();