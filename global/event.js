/**
 * @public EventDispatcher类
 */
define('Event', ['Class'], function(Class) {
	var Klass = Class(function() {
		this._dispatcher = $({});
	}).methods({
		bind: function() {
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
	});
	['unbind', 'trigger'].forEach(function(k){
		Klass.prototype[k] = function() {
			this._dispatcher[k].apply(this._dispatcher, Array.prototype.slice.call(arguments, 0));

		}
	});
	Klass.mix = function() {
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
});