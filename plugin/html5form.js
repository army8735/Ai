(function() {

	var body = $(document.body);

	function showError(node, message) {
		var box = $('<div>').addClass('error').html(message).hide().appendTo(body),
			left = node.offset().left + node.outerWidth() + 10,
			top = node.offset().top;
		if(left + box.outerWidth() > body.innerWidth()) {
			left = body.innerWidth() - box.outerWidth();
		}
		box.css({
			left: left + 'px',
			top: top + 'px'
		}).slideDown(200).click(function() {
			node.focus();
		});
		return box;
	}

	$.fn.html5form = function(cb) {
		$(this).each(function() {
			var form = $(this),
				novalidate = !$.isUndefined(form.attr('novalidate')),
				inputs = form.find(':input:visible:not(:button, :submit, :radio, :checkbox)'),
				input = document.createElement('input'),
				autofocus = 'autofocus' in input,
				placeholder = 'placeholder' in input,
				required = 'required' in input,
				validArray = [];

			//有novalidate属性的话无需验证表单
			if(novalidate) {
				return;
			}

			inputs.each(function(index) {
				var item = $(this),
					type = item.attr('type').toLowerCase(),
					sourceType = this.getAttribute('type').toLowerCase();
				//placeholder占位符
				if(!placeholder && item.attr('placeholder')) {
					var ph = item.attr('placeholder'),
						place;
					if(ph.length) {
						item.focus(function() {
							//打开状态下认为是占位符
							if(place) {
								item.val('');
							}
						});
						item.blur(function() {
							//离开时如有输入数据开关关闭，否则打开占位符
							if(item.val() == '') {
								item.val(ph);
								place = true;
							}
							else {
								place = false;
							}
						});
						item.blur();
						//blur后判断一下，因为ie和ff会在刷新页面后遗留表单数据，此时占位符就成为遗留的默认数据了
						if(ph == item.val()) {
							place = true;
						}
					}
				}
				//autofocus自动聚焦
				if(!autofocus && !$.isUndefined(item.attr('autofocus'))) {
					item.focus();
					//ie下需重新赋值使得光标至最后
					if(item.val().length && $.browser.msie) {
						item.val(item.val());
					}
				}
				//required
				if(this.getAttribute('required') != null) {
					item.blur(function() {
						if(!validArray[index] && $.trim(item.val()) == '') {
							validArray[index] = showError(item, '此项必填');
						}
					});
				}

				//email类型，使用原生getAttribute可获取，否则不支持的浏览器一律为text
				if(type == 'email' || sourceType == 'email') {
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length && !/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(v)) {
								validArray[index] = showError(item, 'Email格式不合法');
							}
						}
					});
				}
				//url类型
				else if(type == 'url' || sourceType == 'url') {
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length && !/[a-zA-z]+:\/\/[^\s]*/.test(v)) {
								validArray[index] = showError(item, 'Url格式不合法');
							}
						}
					});
				}
				//number类型
				else if(type == 'number' || sourceType == 'number') {
					var max = parseFloat(item.attr('max')),
						min = parseFloat(item.attr('min'));
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length) {
								v = parseFloat(v);
								if(isNaN(v)) {
									validArray[index] = showError(item, '这不是一个数字');
								}
								else {
									if(!isNaN(max) && v > max) {
										validArray[index] = showError(item, '超出范围，不能大于' + max);
									}
									if(!isNaN(min) && v < min) {
										validArray[index] = showError(item, '超出范围，不能小于' + max);
									}
								}
							}
						}
					});
				}
				//date类型
				else if(type == 'date' || sourceType == 'date') {
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length && !/^\d{2,4}-\d{1,2}-\d{1,2}$/.test(v)) {
								validArray[index] = showError(item, '日期格式不合法，正确例如：87-3-5');
							}
						}
					});
				}
				//time类型
				else if(type == 'time' || sourceType == 'time') {
					item.blur(function() {
						var v = item.val().trim();
						if(v.length && !/^\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?$/.test(v)) {
							validArray[index] = showError(item, '时间格式不合法，正确例如：8:7:3.5');
						}
					});
				}
				//所有的:input聚焦时都要隐藏可能存在的错误提示框
				item.focus(function() {
					var error = validArray[index];
					if(error) {
						error.remove();
						validArray[index] = null;
					}
				});
			});

			//ie下侦听onpropertychange事件，标准侦听oninput
			if(window.attachEvent) {
				form.find(':input:visible:not(:button, :submit, :radio, :checkbox)').bind('propertychange', function() {
					//
				});
			}
			else {
				form.delegate(':input:visible:not(:button, :submit, :radio, :checkbox)', 'input', function() {
					//
				});
			}

			form.submit(function() {
				//
			});
		});
	}

})();