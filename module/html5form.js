define(['html5formcore'], (function() {

	var TYPE_MES = {
			'url': 'url格式不合法',
			'email': 'email格式不合法',
			'number': '这不是一个数字',
			'max': '超过最大值',
			'min': '小于最小值',
			'date': '日期格式不合法',
			'time': '时间格式不合法',
			'color': '颜色格式不合法',
			'required': '此项必填'
		},
		win = $(window);

	function shake(node) {
		var st = win.scrollTop(),
			height = win.height(),
			ot = node.offset().top;
		if(ot > st + height || ot < st) {
			win.scrollTop(ot);
		}
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
					o.after('<span class="td_error">' + (TYPE_MES[type] || '错误的格式') + '</span>');
					shake(o);
				},
				input: function() {
					var o = $(this);
					o.removeClass('td_valid');
					o.next('span.td_error').remove();
				},
				submit: function() {
					return cb.call(form[0]) !== false;
				}
			});
		});
		return this;
	}

})());