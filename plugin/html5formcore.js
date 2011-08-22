(function() {

	var TYPE_VALID = {
			'url': /^[a-zA-z]+:\/\/[^\s]*$/,
			'email': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
			'number': /^\d+$/,
			'date': /^\d{2,4}-\d{1,2}-\d{1,2}$/,
			'time': /^\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?$/,
			'color': /^#[a-z\d]{3,6}$/
		};
	$.fn.html5formcore = function(options) {
		options = $.extend({
			placeholder: function() {},
			valid: function() {},
			input: function() {},
			submit: function() {}
		}, options);
		this.each(function(i, o) {
			//仅限1个表单对象
			var form = $(o);
			//验证节点
			if(o.nodeName != 'FORM') return;
			//novalidate属性存在时忽略校验
			var novalidate = !!form.attr('novalidate');
			if(novalidate) return;
			var inputs = form.find(':input:not(:button, :submit, :radio, :checkbox)'),
				input = document.createElement('input'),
				autofocus = 'autofocus' in input,
				placeholder = 'placeholder' in input,
				required = 'required' in input,
				maxlength = 'maxlength' in input,
				validArray = [];
			inputs.each(function(index) {
				var item = $(this),
					type = item.attr('type');
				//placeholder占位符
				if(!placeholder && item.attr('placeholder')) {
					var ph = item.attr('placeholder'),
						last,
						place; //开关，标明input当前是否是占位符状态。
					//占位符为空字符串无效
					if(ph.length) {
						function focus() {
							//打开状态下认为是占位符
							if(place) {
								item.val('');
								if(!last) {
									options.placeholder.call(item[0], true);
								}
							}
							else if(last) {
								options.placeholder.call(item[0], false);
							}
							last = place;
						}
						function blur() {
							//离开时如有输入数据开关关闭，否则打开
							if(item.val() == '') {
								item.val(ph);
								place = true;
								if(!last) {
									options.placeholder.call(item[0], true);
								}
							}
							else {
								place = false;
								if(last) {
									options.placeholder.call(item[0], false);
								}
							}
							last = place;
						}
						item.focus(focus).blur(blur);
						//初始化判断，因为ie和ff会在刷新页面后可能autocomplete遗留表单数据，此时占位符就成为遗留的默认数据；也可能在js执行前有用户输入。唯一的缺点是假如在js执行前用户输入的和占位符相同，会被误认为占位符，可忽视。
						if(ph == item.val() || item.val() == '') {
							last = place = true;
							item.val(ph);
							options.placeholder.call(item[0], true);
						}
						else {
							last = place = false;
							options.placeholder.call(item[0], false);
						}
					}
				}
				//maxlength，只有ie的textarea不支持，需模拟
				var maxLength = parseInt(item.attr('maxlength'));
				if(this.nodeName == 'TEXTAREA' && window.attachEvent && !isNaN(maxLength)) {
					function input() {
						var v = item[0].value;
						if(v.length > maxLength) {
							var i,
								bookmark,
								oS = document.selection.createRange(),
								oR = document.body.createTextRange();
							oR.moveToElementText(item[0]);
							bookmark = oS.getBookmark();
							for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++) {
								//ie的\n也算一个长度
								if(v.charAt(i) == '\n') {
									i++;
								}
							}
							item.val(v.substr(0, i - 1) + v.substr(i, v.length));
							//模拟光标位置
							if(v.length != i) {
								var range = item[0].createTextRange();
								range.collapse(true);
								range.moveEnd('character', i - 1);
								range.moveStart('character', i - 1);
								range.select();
							}
						}
					}
					this.attachEvent('onpropertychange', input);
					input();
				}
				//autofocus自动聚焦
				if(!autofocus && item.attr('autofocus')) {
					item.focus();
				}
				//required
				if(item.attr('required')) {
					item.blur(function() {
						validArray[index] = (item.val().trim() == '');
						if(validArray[index] && !item.prop('disabled') && item.is(':visible')) {
							options.valid.call(item[0], 'required');
						}
					});
				}
				//几种input类型的校验
				var typeValid = TYPE_VALID[type];
				if(this.nodeName == 'INPUT' && typeValid) {
					item.blur(function() {
						var v = item.val().trim();
						validArray[index] = (v.length && !typeValid.test(v));
						if(validArray[index] && !item.prop('disabled') && item.is(':visible')) {
							options.valid.call(item[0], type);
						}
					});
				}
				//number类型另附验证范围
				if(type == 'number') {
					var max = parseFloat(item.attr('max')),
						min = parseFloat(item.attr('min'));
					if(!isNaN(max) || !isNaN(min)) {
						item.blur(function() {
							var v = item.val().trim();
							if(v.length && !item.prop('disabled') && item.is(':visible')) {
								v = parseFloat(v);
								if(!isNaN(max) && v > max) {
									validArray[index] = true;
									options.valid.call(item[0], type, min, max);
								}
								else if(!isNaN(min) && v < min) {
									validArray[index] = true;
									options.valid.call(item[0], type, min, max);
								}
								else {
									validArray[index] = false;
								}
							}
						});
					}
				}
				//自定义pattern
				var pattern = item.attr('pattern');
				if(pattern && pattern.length) {
					pattern = new RegExp(pattern);
					item.blur(function() {
						var v = item.val().trim();
						validArray[index] = (v.length && !pattern.test(v));
						if(validArray[index]) {
							options.valid.call(item[0], 'pattern');
						}
					});
				}
				//所有的:input有改动时都要触发回调，ie下由于不支持input事件，改为focus
				function onInput() {
					options.input.call(item[0], 'input');
				}
				if(window.addEventListener) {
					this.addEventListener('input', onInput, false);
				}
				else {
					item.focus(onInput);
				}
			});

			form.submit(function() {
				inputs.blur(); //全部触发可能存在的校验
				var validResult = true;
				validArray.forEach(function(item, i) {
					var input = inputs.eq(i);
					if(item && !input.prop('disabled') && input.is(':visible')) {
						validResult = false;
					}
				});
				//本身通过html5校验，如有传入callback，返回callback的值
				if(validResult && $.isFunction(options.submit)) {
					validResult = options.submit.call(this) !== false;
				}
				return validResult;
			});
		});
	}

})();