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

$.cookie = function(name, value, options) {
	if(value !== undefined) { // name and value given, set cookie
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

define( "jquery", function () { return jQuery; } );