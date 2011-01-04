$$.mix({
	/**
	 * @public 生成随机整数
	 * @note 最小为0
	 * @param {number} min,max是随机数的范围，当只有一个参数时，min默认为0。当没有参数时，默认Math.random()的整数
	 * @return {int} 返回大于或等于0，小于范围的整数
	 */
	rand: function(min, max) {
		if($.isUndefined(min)) {
			return Math.floor(Math.random() * 100000000000000000);
		}
		else if($.isUndefined(max)) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min));
	},

	/**
	 * @public 取最大值
	 * @note 仅限数字
	 */
	max: function() {
		var args = arguments,
			i = args.length - 2,
			v = args[i + 1];
		for(; i > -1; i--) {
			if(args[i] > v) v = args[i];
		}
		return v;
	},

	/**
	 * @public 取最小值
	 * @note 仅限数字
	 */
	min: function() {
		var args = arguments,
			i = args.length - 2,
			v = args[i + 1];
		for(; i > -1; i--) {
			if(args[i] < v) v = args[i];
		}
		return v;
	},
	
	/**
	 * @public html转义
	 * @param {string} 需要转义的字符串
	 */
	escape: function(str){
		var xmlchar = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;',
			'{': '&#123;',
			'}': '&#125;',
			'@': '&#64;'
		};
		return str.replace(/[<>''\{\}&@]/g, function($1){
			return xmlchar[$1];
		});
	},
	
	/**
	 * @public 取字符串的字节长度
	 * @param {string} 字符串
	 */
	byteLen: function(str) {
		return str.replace(/([^\x00-\xff])/g, '$1 ').length;
	},

	/**
	 * @public 按字节长度截取字符串
	 * @param {string} str是包含中英文的字符串
	 * @param {int} limit是长度限制（按英文字符的长度计算）
	 * @return {string} 返回截取后的字符串,默认末尾带有'...'
	 */
	substr: function(str, limit){
		var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
		return sub + '...';
	},

	/**
	 * @public 字符串是否以指定sub结尾
	 * @param {string} str需要确定的字符串
	 * @return {string} 结尾
	 */
	endWith: function(str, sub){
		return str.lastIndexOf(sub) == str.length - sub.length;
	},

	/**
	 * @public 把JS模板转换成最终的html
	 * @note 模板中的变量格式：<%=xxx%>
	 * @param {string} tpl是模板文本
	 * @param {object} op是模板中的变量
	 * @return {string} 返回可使用的html
	 */
	render: function(tpl, op){
		op = op || {};
		return tpl.replace(/<%\=(\w+)%>/g, function(e1,e2){
			return op[e2] != null ? op[e2] : '';
		});		
	},
	
	/**
	 * @public 把文本复制到剪贴板
	 * @note 目前只支持ie
	 * @param {string} url是文本内容
	 * @param {func} succ是回调函数，参数是是否成功
	 */
	copyToClip : function(url, cb){
		cb = cb || function(){};
		if(window.clipboardData) {
			if(window.clipboardData.setData('text', url)) {
				cb(true);
			}
			else {
				cb(false);
			}
		}
		else {
			cb(false);
		}
	},

        render : function(){}
});