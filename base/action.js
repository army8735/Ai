(function() {
	var id = '-ai';

	/**
	 * @public 生成一个新的事件驱动对象
	 * @return new $$.Action();
	 */
	$$.Action = function() {
		this.__action = $('<p>');
	};
	$$.Action.prototype = {
		constructor: $$.Action,
		/**
		 * @public 绑定事件侦听
		 * @param {string} 绑定的事件名
		 * @param {object} 绑定时的数据，可省略
		 * @param {func} 侦听的执行方法
		 */
		bind: function(type, data, cb) {
			if($.isUndefinde(cb)) {
				cb = data;
				data = {};
			}
			this.__action.bind(id + type, data, cb);
		},
		/**
		 * @public 接触绑定事件侦听
		 * @param {string} 绑定的事件名
		 * @param {func} 侦听的执行方法，可省略，省略为取消所有
		 */
		unbind: function(type, cb) {
			this.__action.unbind(id + type, cb);
		},
		/**
		 * @public 触发事件，仅一次
		 * @param {string} 触发的事件名
		 * @param {object} 触发时的数据，可省略
		 */
		one: function(type, data) {
			this.__action.one(id + type, data || {});
		},
		/**
		 * @public 触发事件，可多次
		 * @param {string} 触发的事件名
		 * @param {object} 触发时的数据，可省略
		 */
		trigger: function(type, data) {
			this.__action.trigger(id + type, data || {});
		}
	};

	//默认的全局事件驱动对象
	$$.action = new $$.Action();

})();