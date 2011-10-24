define('Event', function() {
	function Klass() {
		this._event = $('<p>');
	}
	Klass.prototype.addEventListener = function() {
		this._event.bind.apply(this._event, Array.prototype.slice.call(arguments, 0));
	}
	Klass.prototype.removeEventListener = function() {
		this._event.unbind.apply(this._event, Array.prototype.slice.call(arguments, 0));
	}
	Klass.prototype.dispatchEvent = function() {
		this._event.triggerHandler.apply(this._event, Array.prototype.slice.call(arguments, 0));
	}
	$$.Event = Klass;
	$$.event = new Klass();
	return Klass;
});