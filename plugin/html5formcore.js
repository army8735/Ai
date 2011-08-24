(function() {

	var TYPE_VALID = {
			'url': /^\s*[a-zA-z]+:\/\/.*$/,
			'email': /^\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s*$/,
			'number': /^\s*-?\.*\d+\s*$/,
			'date': /^\s*\d{2,4}-\d{1,2}-\d{1,2}\s*$/,
			'time': /^\s*\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?\s*$/,
			'color': /^\s*#?[a-z\d]{3,6}\s*$/
		},
		input = document.createElement('input'),
		AUTOFOCUS = 'autofocus' in input,
		PLACEHOLDER = 'placeholder' in input,
		FORM = 'form' in input,
		SELECTOR = ':input:not(:button, :submit, :radio, :checkbox)';
	$.fn.html5formcore = function(options) {
		options = $.extend({
			placeholder: function() {},
			valid: function() {},
			input: function() {},
			submit: function() {}
		}, options);

		this.each(function(i, o) {
			//验证节点
			if(o.nodeName != 'FORM') return;
			var form = $(o),
				itemList = [], //保存所有valid过的节点列表
				validList = [], //对应itemList，保存此节点valid的bool结果
				textareas = []; //保存已对ie进行maxlength属性模拟的ta列表
			//autofocus
			if(!AUTOFOCUS) {
				form.find(':input:visible').each(function() {
					if(this.getAttribute('autofocus') != null) {
						$(this).focus();
					}
				});
			}
			//placeholder
			if(!PLACEHOLDER) {
				form.find('input[placeholder]').each(function() {
					var item = $(this),
						ph = item.attr('placeholder'),
						last,
						place;
					function focus() {
						//打开状态下认为是占位符
						if(place) {
							item.val('');
							place = false
							if(last != place) {
								options.placeholder.call(item[0], false);
							}
						}
						last = place;
					}
					function blur() {
						//离开时如有输入数据开关关闭，否则打开
						if(item.val() == '') {
							item.val(ph);
							place = true;
							if(last != place) {
								options.placeholder.call(item[0], true);
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
				});
			}
			form.delegate(SELECTOR, 'focusout', function() {
				handler.call(this, 'blur');
			});
			if(window.addEventListener) {
				form.delegate(SELECTOR, 'input', function() {
					handler.call(this, 'input');
				});
			}
			else {
				form.delegate(SELECTOR, 'keydown', function() {
					handler.call(this, 'input');
				});
				//ie模拟textarea的maxlength属性
				form.delegate('textarea', 'focusin', function() {
					if(textareas.indexOf(this) == -1) {
						textareas.push(this);
						$(this).bind('propertychange', function() {
							virtualTextareaMaxlength($(this));
						});
					}
				});
			}
			form.delegate('input[type=submit]', 'click', function() {
				var item = $(this),
					formObj,
					formAttr = this.getAttribute('form'), //jq1.4兼容
					formMethod = item.attr('formmethod'),
					formTarget = item.attr('formtarget'),
					formAction = item.attr('formaction'),
					formEnctype = item.attr('formenctype'),
					formNovalidate = item.attr('formnovalidate');
				//form属性在ie下未指定时会返回节点本身
				if(formAttr && $.isString(formAttr)) {
					formObj = $('#' + formAttr);
				}
				else {
					formObj = form;
				}
				//不支持submit的html5属性的，在提交前模拟，完成后改回来
				if(!FORM) {
					if(formMethod) {
						virtualSubmitAttr.call(formObj, 'method', formMethod);
					}
					if(formTarget) {
						virtualSubmitAttr.call(formObj, 'target', formTarget);
					}
					if(formAction) {
						virtualSubmitAttr.call(formObj, 'action', formAction);
					}
					if(formEnctype) {
						virtualSubmitAttr.call(formObj, 'enctype', formAction);
					}
				}
				if(formNovalidate) {
					virtualSubmitAttr.call(formObj, 'novalidate', formNovalidate);
				}
				formObj.submit();
				return false;
			});
			form.submit(function() {
				form.find(SELECTOR).focusout(); //全部触发一次校验
				var res = true;
				if(!form.attr('novalidate')) {
					validList.forEach(function(item) {
						if(item) {
							res = false;
						}
					});
				}
				//本身通过html5校验，如传入callback，返回callback的值
				if(res && $.isFunction(options.submit)) {
					res = (options.submit.call(this) !== false);
				}
				return res;
			});

			function virtualSubmitAttr(name, value) {
				var source = form.attr(name),
					f = this;
				f.attr(name, value);
				setInterval(function() {
					if(!source) {
						f.removeAttr(name);
					}
					else {
						f.attr(name, source);
					}
				}, 0);
			}

			function handler(event) {
				var item = $(this),
					v = item.val(),
					index = getIndex(this),
					type = (item[0].getAttribute('type') || 'text').toLowerCase(),
					pattern = item.attr('pattern'),
					required = this.getAttribute('required') != null;
				if(event == 'blur') {
					//required
					if(required) {
						if(v == '' && !ignore(item)) {
							validList[index] = 1;
							options.valid.call(this, 'required');
						}
						else {
							validList[index] = 0;
						}
					}
					//几种input类型
					if(v.length && this.nodeName == 'INPUT' && TYPE_VALID[type]) {
						if(TYPE_VALID[type].test(v) || ignore(item)) {
							validList[index] = 0;
						}
						else {
							validList[index] = 1;
							options.valid.call(this, type);
						}
					}
					//number类型另附验证范围
					if(v.length && type == 'number' && TYPE_VALID[type].test(v)) {
						var max = parseFloat(item.attr('max')),
							min = parseFloat(item.attr('min'));
						if(ignore(item)) {
							validList[index] = 0;
						}
						else {
							v = parseFloat(v);
							if(!isNaN(max)) {
								if(v > max) {
									validList[index] = 1;
									options.valid.call(this, 'max', max);
								}
								else {
									validList[index] = 0;
								}
							}
							if(!isNaN(min)) {
								if(v < min) {
									validList[index] = 1;
									options.valid.call(this, 'min', min);
								}
								else {
									validList[index] = 0;
								}
							}
						}
					}
					//自定义pattern，只支持text类型
					if(pattern && pattern.length && type == 'text') {
						pattern = new RegExp(pattern);
						if(!v.length || pattern.test(v) || ignore(item)) {
							validList[index] = 0;
						}
						else {
							validList[index] = 1;
							options.valid.call(this, 'pattern');
						}
					}
				}
				else if(event == 'input') {
					options.input.call(this, 'input');
				}
			}
			function getIndex(item) {
				var i = itemList.indexOf(item);
				//此节点还未出现时push
				if(i == -1) {
					i = itemList.length;
					itemList.push(item);
				}
				return i;
			}
			function ignore(item) {
				return form.attr('novalidate') || item.attr('disabled') || item.is(':hidden');
			}
		});
	}

	function virtualTextareaMaxlength(item) {
		var max = parseInt(item.attr('maxlength')),
			v = item.val();
		if(!isNaN(max) && v.length > max) {
			var i,
				bookmark,
				oS = document.selection.createRange(),
				oR = document.body.createTextRange();
			oR.moveToElementText(item[0]);
			bookmark = oS.getBookmark();
			for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++) {
				//ie的换行是\r\n，算2个字符长度
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

})();