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