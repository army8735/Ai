$$.mix({
	charset: document.charset || document['characterSet'],

	/**
	 * @public 是否是闭合标签
	 */
	isCloseTag: function(tagName){
		return !!({area:1,base:1,col:1,hr:1,img:1,br:1,input:1,link:1,meta:1,param:1})[tagName.toLowerCase()];
	},

	/**
	 * @public 继承jq的browser方法，并增加几个特性
	 */
	browser: (function() {
		var userAgent = navigator.userAgent;
		return $.extend({
			// 是否为mobile safari浏览器（iphone, ipod touch, ipad）
			mobileSafari: $.browser.safari && / Mobile\//.test(userAgent),
			//语言特性
			lang: (navigator.language || navigator.systemLanguage).toLowerCase(),
			iOS: (this.mobileSafari ? (userAgent.match(/(ipad|iphone|ipod)/) || [])[0] : false),
			se360: /360SE/.test(userAgent),
			maxthon: /Maxthon/.test(userAgent),
			tt: /TencentTraveler\s[\d.]*/.test(userAgent),
			theWorld: /TheWorld/.test(userAgent),
			sogo: /SE\s[\d.]*/.test(userAgent)
		}, $.browser);
	})(),
	
	/**
	 * @public 操作系统
	 */
	system: (function() {
		var p = navigator.platform.toLowerCase();
		return {
			windows: p ? /win/.test(p) : /win/.test(userAgent),
			mac: p ? /mac/.test(p) : /mac/.test(u)
		}
	})()

});