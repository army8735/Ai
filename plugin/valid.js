(function() {

	var match = {
		'int': /^\d+$/,
		'float': /^\d*\.\d+$/,
		'number': /^[\d.]+$/,
		'phone': /^(13|15|18)\d{9}$/,
		'id': /^[a-z_\d]+$/i,
		'byte': /.+/,
		'require': /.+/,
		'chinese': /^[\u4e00-\u9fa5]+$/,
		'postal': /^[1-9]\d{5}$/,
		'qq': /^[1-9]\d{4,}$/,
		'url': /([a-z]+\:\/\/)?[^\s]+/,
		'email': /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
	};

	function valid(node, mes, res) {
		var rules = node.attr('valid'),
			value = node.val(),
			errMes;
		//规则中定义了trim说明校验时需对value先trim
		if(rules.indexOf('trim') > -1) {
			value = $.trim(value);
		}
		//以空格分隔规则，遍历校验每个规则
		rules.split(' ').forEach(function(item) {
			//一个规则不通过其它规则省略
			if(!errMes) {
				item = item.split(':'); //:后面是错误提示信息hash的key
				var rule = item[0].toLowerCase(),
					info = mes[item[1]] || 'error';
				//规则可以是自定义正则，以/开头
				if(rule.charAt(0) == '/') {
					if(!rule.test(value)) {
						errMes = info;
					}
				}
				//其它情况是内置的校验
				else if(rule != 'trim') {
					var r = /^(.+?)(\{(.+)\})?$/.exec(rule),
						k = match[r[1]] || /.*/,
						len = r[3];
					//没通过内置正则直接错误
					if(!k.test(value)) {
						errMes = info;
					}
					//通过后检查是否有长度定义（和正则语法相同{min,max}）
					else if(len) {
						len = len.split(',');
						var length = value == 'byte' ? $$.byteLen(value) : value.length;
						if(len.length == 1) {
							if(length != len[0]) {
								errMes = info;
							}
						}
						else {
							var min = parseInt(len[0]) || 0,
								max = parseInt(len[1]) || value.length + 1;
							if(length < min || length > max) {
								errMes = info;
							}
						}
					}
				}
			}
		});
		if(errMes) {
			res.push({
				node: node,
				mes: errMes
			});
		}
	}

	$$.mix({
		/**
		 * @public 表单校验，返回一个包含valid()方法的对象，提供校验功能
		 * @param {string/node} 表单的id或者表单对象
		 * @param {object} 错误提示信息hash
		 * @return {array/false} 返回false说明校验成功，array则是未通过校验的元素列表
		 */
		formValid: function(form, mes) {
			form = ($.isString(form) && form.charAt(0) != '#') ? $('#' + form) : $(form);
			mes = mes || {};
			var list = form.find(':input[valid]');
			return {
				valid: function() {
					var res = [];
					list.each(function() {
						var item = $(this);
						//仅在此元素可用时才进行校验
						if(!item.attr('disabled')) {
							valid(item, mes, res);
						}
					});
					return res.length ? res : false;
				}
			};
		}
	}, 'valid');

})();