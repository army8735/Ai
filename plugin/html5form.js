(function() {

	var body = $(document.body),
		PLACE_HOLDER_CLASS = 'td_placeholder',
		ERROR_CLASS = 'td_error',
		TIP_CLASS = 'td_tip',
		TYPE_VALID = {
			'url': {
				pattern: /^[a-zA-z]+:\/\/[^\s]*$/,
				message: 'url格式不合法'
			},
			'email': {
				pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
				message: 'email格式不合法'
			},
			'number': {
				pattern: /^\d+$/,
				message: '这不是一个数字'
			},
			'date': {
				pattern: /^\d{2,4}-\d{1,2}-\d{1,2}$/,
				message: '日期格式不合法'
			},
			'time': {
				pattern: /^\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?$/,
				message: '时间格式不合法'
			},
			'color': {
				pattern: /^#[a-z\d]{3,6}$/,
				message: '颜色格式不合法'
			}
		},
		tipBox,
		tpl = [
			'<table class="td_mesbox" cellspacing="0" cellpadding="0"><tbody>',
				'<tr>',
					'<td class="round left_top"></td>',
					'<td class="line top"></td>',
					'<td class="round right_top"></td>',
				'</tr><tr>',
					'<td class="left"></td>',
					'<td class="center">',
						'<div class="container"><%=text%></div>',
					'</td>',
					'<td class="right"></td>',
				'</tr><tr>',
					'<td class="round left_bottom"></td>',
					'<td class="line bottom"></td>',
					'<td class="round right_bottom"></td>',
				'</tr>',
			'</tbody></table>'
		].join('');

	function showError(node, message) {
		var s = $$.render(tpl, { text: message }),
			box = $('<div>').addClass(ERROR_CLASS).html(s).hide().appendTo(body),
			pos = getPos(node, box);
		//最初的坐标保存起来
		box.data('html5form_left', pos.left).data('html5form_top', pos.top);
		//以及对:input的引用
		box.data('html5form_node', node);
		//设置位置
		box.css({
			left: pos.left + 'px',
			top: pos.top + 'px'
		}).fadeIn(200).click(function() {
			node.focus().val(node.val());
		});
		shake(box);
		return box;
	}
	function hideError(box) {
		clearShake(box);
		box.remove();
	}
	function shake(box) {
		clearShake(box);
		var offset = 1,
			count = 0;
		//颤动动画存在自身的interval变量上
		box.data('html5form_interval', setInterval(function() {
			if(count++ > 10) {
				clearShake(box);
			}
			box.css({
				left: box.data('html5form_left') + offset + 'px',
				top: box.data('html5form_top') + offset + 'px'
			});
			offset *= -1;
		}, 50));
		//引用节点闪现
		box.data('html5form_node').stop().fadeOut(100).fadeIn(100);
	}
	function clearShake(box) {
		var interval = box.data('html5form_interval');
		if(interval) {
			clearInterval(interval);
		}
	}
	function showTip(node, current, maxLength) {
		if(!tipBox) {
			var s = $$.render(tpl, { text: '' });
			tipBox = $('<div>').addClass(TIP_CLASS).html(s);
		}
		//focus时显示并设置位置
		if(node) {
			tipBox.hide().appendTo(body);
			var pos = getPos(node, tipBox);
			tipBox.css({
				left: pos.left + 'px',
				top: pos.top + 'px'
			}).fadeIn(200);
		}
		//更新说明
		current = current > maxLength ? '<strong>' + current + '</strong>' : current;
		tipBox.find('div.container').html(current + ' / ' + maxLength);
	}
	function hideTip() {
		if(tipBox) {
			tipBox.remove();
		}
	}
	function getPos(node, box) {
		var left = node.offset().left + node.outerWidth() + 10,
			top = node.offset().top;
		//不够放在node后面的时候，放在前面，top暂不考虑，很少遇到
		if(left + box.outerWidth() > body.innerWidth()) {
			left = Math.max(1, node.offset().left - box.outerWidth() - 10);
		}
		return {
			left: left,
			top: top
		};
	}

	$.fn.html5form = function(cb) {
		this.each(function() {
			var form = $(this),
				novalidate = !$.isUndefined(form.attr('novalidate')),
				inputs = form.find(':input:visible:not(:button, :submit, :radio, :checkbox)'),
				input = document.createElement('input'),
				autofocus = 'autofocus' in input,
				placeholder = 'placeholder' in input,
				required = 'required' in input,
				maxlength = 'maxlength' in input,
				validArray = [];

			//有novalidate属性的话无需验证表单
			if(novalidate) {
				return;
			}

			inputs.each(function(index) {
				var item = $(this),
					type = (this.getAttribute('type') || '').toLowerCase(),
					interval;
				//placeholder占位符
				if(!placeholder && this.getAttribute('placeholder') != null) {
					var ph = item.attr('placeholder'),
						place; //开关，标明input当前是否是占位符状态。
					//占位符为空字符串无效
					if(ph.length) {
						function focus() {
							//打开状态下认为是占位符
							if(place) {
								item.val('').removeClass(PLACE_HOLDER_CLASS);
							}
						}
						function blur() {
							//离开时如有输入数据开关关闭，否则打开
							if(item.val() == '') {
								item.val(ph).addClass(PLACE_HOLDER_CLASS);
								place = true;
							}
							else {
								place = false;
							}
						}
						item.focus(focus).blur(blur);
						//初始化判断，因为ie和ff会在刷新页面后可能autocomplete遗留表单数据，此时占位符就成为遗留的默认数据；也可能在js执行前有用户输入。唯一的缺点是假如在js执行前用户输入的和占位符相同，会被误认为占位符，可忽视。
						if(ph == item.val() || item.val() == '') {
							place = true;
							item.val(ph).addClass(PLACE_HOLDER_CLASS);
						}
					}
				}
				//autofocus自动聚焦
				if(!autofocus && this.getAttribute('autofocus') != null) {
					item.focus();
					//有遗留数据时ie下需重新赋值使得光标至最后
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

				//默认的校验
				var typeValid = TYPE_VALID[type];
				if(this.nodeName.toLowerCase() == 'input' && typeValid) {
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length && !typeValid.pattern.test(v)) {
								validArray[index] = showError(item, typeValid.message || '格式不正确');
							}
						}
					});
				}
				//number类型另附验证范围
				if(type == 'number') {
					var max = parseFloat(item.attr('max')),
						min = parseFloat(item.attr('min'));
					if(!isNaN(max) || !isNaN(min)) {
						item.blur(function() {
							if(!validArray[index]) {
								var v = item.val().trim();
								if(v.length) {
									v = parseFloat(v);
									if(!isNaN(max) && v > max) {
										validArray[index] = showError(item, '超出范围，不能大于' + max);
									}
									if(!isNaN(min) && v < min) {
										validArray[index] = showError(item, '超出范围，不能小于' + max);
									}
								}
							}
						});
					}
				}
				//自定义pattern
				var pattern = this.getAttribute('pattern');
				if(pattern != null && pattern.length) {
					pattern = new RegExp(pattern);
					item.blur(function() {
						if(!validArray[index]) {
							var v = item.val().trim();
							if(v.length && !pattern.test(v)) {
								validArray[index] = showError(item, '格式不正确');
							}
						}
					});
				}
				//maxlength
				var maxLength = parseInt(this.getAttribute('maxlength'));
				if(!isNaN(maxLength)) {
					function input() {
						showTip(null, item.val().length, maxLength);
					}
					item.focus(function() {
						showTip(item, item.val().length, maxLength);
					}).blur(function() {
						hideTip();
						var v = item.val().length;
						if(!validArray[index] && v > maxLength) {
							validArray[index] = showError(item, '最多只允许输入<strong>' + maxLength + '</strong>个字符');
						}
					});
					//input事件除了ie都支持，可以用onpropertychange代替
					if(window.addEventListener) {
						this.addEventListener('input', input, false);
					}
					else if(window.attachEvent) {
						this.attachEvent('onpropertychange', input);
					}
				}

				//所有的:input聚焦时都要隐藏可能存在的错误提示框
				item.focus(function() {
					var error = validArray[index];
					if(error) {
						hideError(error);
						validArray[index] = null;
					}
				});
			});

			form.submit(function() {
				inputs.blur(); //全部触发可能存在的校验
				var validResult = true,
					first;
				validArray.forEach(function(item) {
					if(item) {
						validResult = false;
						shake(item);
						if(!first) {
							first = true;
							//scroll到第一个错误框，暂不考虑第一个是否就是最上面的
							var top = item.offset().top,
								height = item.outerHeight(),
								scrollTop = $(window).scrollTop(),
								winHeight = $(window).height();
							if(top < scrollTop) {
								$(window).scrollTop(top);
							}
							else if(top + height> scrollTop + winHeight) {
								$(window).scrollTop(top + height - winHeight);
							}
						}
					}
				});
				//本身通过html5校验，如有传入callback，返回callback的值
				if(validResult && $.isFunction(cb)) {
					validResult = cb.call(this) !== false;
				}
				return validResult;
			});
		});
		return this;
	}

})();