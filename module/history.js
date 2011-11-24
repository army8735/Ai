define(['Event', 'Class'], function(Event, Class) {
	var id = 0,
		orignal = ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode == 8),
		cbs = [];
	if(orignal) {
		window.onhashchange = function() {
			cbs.forEach(function(cb) {
				cb();
			});
		}
	}
	var Klass = Event.extend(function(src) {
		var self = this;
		Event.call(self);
		self.id = id++;
		self.src = src;
		if(orignal)
			cbs.push(function() {
				self.trigger('hashChange', location.hash);
			});
		else
			self.iframe = $('<iframe src="' + src + '">');
		$(document.body).append(this.iframe);
		Klass.list.push(self);
	}).methods({
		add: function(url) {
			if(!orignal){
				var doc = this.iframe[0].contentWindow.document;
				doc.open();
				doc.write([
					'<html><head><script>',
						'function l() {',
							'try{top.window.$$.History.list[' + this.id + '].trigger("hashChange", "' + url + '");}catch(ex){}',
						'}',
					'</scr',
					'ipt></head><body onload="l()"></body></html>'
				].join(''));
				doc.close();
			}
		}
	});
	Klass.list = [];
	return Klass;
});