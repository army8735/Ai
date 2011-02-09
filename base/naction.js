(function() {
	var action = $('div'),
		id = '-ai';

	$$.mix({
		bind: function(data, cb) {
			if($.isUndefinde(cb)) {
				cb = data;
				data = {};
			}
			action.bind(id, data, cb);
		},
		one: function(data, cb) {
			if($.isUndefinde(cb)) {
				cb = data;
				data = {};
			}
			action.one(id, data, cb);
		},
		trigger: function(data) {
			action.trigger(id, data);
		},
		triggerHandler: function(data) {
			action.triggerHandler(id, data);
		},
		unbind: function(data) {
			action.unbind(data);
		}
	});
})();