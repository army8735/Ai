(function() {

	$.fn.html5form = function(cb) {
		$(this).each(function() {
			var form = $(this);
				inputs = form.find(':input:visible:not(:button, :submit, :radio, :checkbox)');
			if(!$.isUndefined(form.attr('novalidate'))) {
				form.submit(function() {
					inputs.each(function() {
					});
				});
			}
			inputs.each(function() {
				var item = $(this),
					type = item.attr('type').toLowerCase(),
					sourceType = this.getAttribute('type').toLowerCase();
				//placeholder占位符
				if(item.attr('placeholder')) {
					var placeholder = item.attr('placeholder'),
						place = !!item.val().length; //判断在js执行前用户已经输入或者刷新遗留的输入数据，如有则将开关打开
					if(placeholder.length) {
						item.focus(function() {
							//打开状态下认为是占位符
							if(place) {
								item.val('');
							}
						});
						item.blur(function() {
							//离开时如有输入数据开关关闭，否则打开占位符
							if(item.val() == '') {
								item.val(placeholder);
								place = true;
							}
							else {
								place = false;
							}
						});
						item.blur();
					}
				}
				//autofocus自动聚焦
				if(!$.isUndefined(item.attr('autofocus')) && !('autofocus' in document.createElement('input'))) {
					item.focus();
				}
				//email类型，使用原生getAttribute可获取，否则不支持的浏览器一律为text
				if(type == 'email' || sourceType == 'email') {
					item.blur(function() {
						if(!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(item.val())) {
							//不符合
						}
					});
				}
				//url类型
				else if(type == 'url' || sourceType == 'url') {
					item.blur(function() {
						if(!/[a-zA-z]+:\/\/[^\s]*/.test(item.val())) {
							//不符合
						}
					});
				}
				//number类型
				else if(type == 'number' || sourceType == 'number') {
					//无原生支持的浏览器，模拟实现
					if(type != sourceType) {
						item.keydown(function(event) {
							var code = event.keyCode;
							if([8, 9, 37, 38, 39, 40, 46, 107, 109, 190, 191].indexOf(code) > -1) {}
							else if(code < 48 || code > 57) {
								return false;
							}
						});
					}
					var max = parseFloat(item.attr('max')),
						min = parseFloat(item.attr('min'));
					item.blur(function() {
						var v = item.val().trim(),
							res = true;
						if(v.length) {
							v = parseFloat(v);
							if(!isNaN(max) && v > max) {
								res = false;
							}
							if(!isNaN(min) && v < min) {
								res = false;
							}
							if(!res) {
								//超过范围
							}
						}
					});
				}
				//date类型
				else if(type == 'date' || sourceType == 'date') {
					//无原生支持的浏览器，模拟实现
					if(type != sourceType) {
						item.keydown(function(event) {
							var code = event.keyCode;
							if([8, 9, 37, 38, 39, 40, 46, 109].indexOf(code) > -1) {}
							else if(code < 48 || code > 57) {
								return false;
							}
						});
					}
					item.blur(function() {
						var v = item.val().trim();
						if(!/^\d{2,4}-\d{1,2}-\d{1,2}$/.test(v)) {
							//不是日期
						}
					});
				}
				//time类型
				else if(type == 'date' || sourceType == 'date') {
					//无原生支持的浏览器，模拟实现
					if(type != sourceType) {
						item.keydown(function(event) {
							var code = event.keyCode;
							var code = event.keyCode;
							if([8, 9, 37, 38, 39, 40, 46, 59, 190].indexOf(code) > -1) {}
							else if(code < 48 || code > 57) {
								return false;
							}
						});
					}
					item.blur(function() {
						var v = item.val().trim();
						if(!/^\d{1,2}:\d{1,2}:\d{1,2}(\.\d{1,3})?$/.test(v)) {
							//不是时间
						}
					});
				}
			});
		});
	}

})();