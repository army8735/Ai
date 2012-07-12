define(['module', 'Event'], function(module, Event) {
	var id = 0,
		orignal = ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode >= 8),
		cbs = [];
	if(orignal) {
		$(window).bind('hashchange', function() {
			cbs.forEach(function(cb) {
				cb();
			});
		});
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
		$(document.body).append(self.iframe);
		Klass.list = Klass.list || [];
		Klass.list.push(self); //静态属性list，记录可能存在的多个实例
	}).methods({
		add: function(url) {
			if(!orignal){
				var self = this,
					doc = self.iframe[0].contentWindow.document;
				doc.open();
				doc.write([
					'<html><head><script>',
						'function l() {',
							'parent.require("' + module.uri + '", function(hashChange) {',
								'hashChange.list[0].trigger("hashChange", "' + url.replace('\\', '\\\\').replace('"', '\\"') + '");',
							'});',
						'}',
					'</scr',
					'ipt></head><body onload="l()"></body></html>'
				].join(''));
				doc.close();
			}
		}
	});
	return Klass;
});