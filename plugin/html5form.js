(function() {

	var TYPE_MES = {
			'url': 'url格式不合法',
			'email': 'email格式不合法',
			'number': '这不是一个数字',
			'date': '日期格式不合法',
			'time': '时间格式不合法',
			'color': '颜色格式不合法',
			'required': '此项必填'
		};

	function shake(node) {
		var i = 10,
			direct = true;
		setInterval(function() {
			if(--i <= 0) {
				clearInterval(node.data('interval'));
				node.css('left', 0);
				return;
			}
			var left = (direct ? '' : '-') + '2px';
			direct = !direct;
			node.css('left', left);
		}, 50);
	}

	$.fn.html5form = function(cb) {
		this.each(function() {
			var form = $(this);
			form.html5formcore({
				placeholder: function(v) {
					var o = $(this);
					v ? o.addClass('td_placeholder') : o.removeClass('td_placeholder');
				},
				valid: function(type) {
					var o = $(this);
					o.addClass('td_valid');
					o.next('span.td_error').remove();
					if(type == 'number' && arguments.length == 3) {
						o.after('<span class="td_error">数值超过范围限制：' + (arguments[1] || '-∞') + '~' + (arguments[2] || '+∞') + '</span>');
					}
					else {
						o.after('<span class="td_error">' + (TYPE_MES[type] || '错误的格式') + '</span>');
					}
					shake(o);
				},
				input: function() {
					var o = $(this);
					o.removeClass('td_valid');
					o.next('span.td_error').remove();
				},
				submit: function() {
					alert('校验通过，可以提交');
					return false;
				}
			});
		});
		return this;
	}

})();