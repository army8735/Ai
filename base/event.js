(function() {
	var id = '-ai',
		BINDED = 1;

	/**
	 * @public 生成一个新的事件驱动对象
	 * @return new $$.Event();
	 */
	$$.Event = function() {
		this._node = $('<p>');
		this._lib = {};
	};
	$$.Event.prototype = {
		constructor: $$.Event,
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
			this._node.bind(id + type, data, cb);
			var self = this,
				o = this._lib[id + type];
			if(o.tag != BINDED) {
				o.tag = BINDED;
				//事先fire过，绑定时要自动触发
				o.list && o.list.forEach(function(o) {
					self.trigger(id + type, o);
				});
			}
		},
		/**
		 * @public 接触绑定事件侦听
		 * @param {string} 绑定的事件名
		 * @param {func} 侦听的执行方法，可省略，省略为取消所有
		 */
		unbind: function(type, cb) {
			this._node.unbind(id + type, cb);
		},
		/**
		 * @public 触发事件，仅一次
		 * @param {string} 触发的事件名
		 * @param {object} 触发时的数据，可省略
		 */
		one: function(type, data) {
			this._node.one(id + type, data || {});
		},
		/**
		 * @public 触发事件，可多次
		 * @param {string} 触发的事件名
		 * @param {object} 触发时的数据，可省略
		 */
		trigger: function(type, data) {
			this._node.trigger(id + type, data || {});
		},
		/**
		 * @public 触发事件，可多次，可以先触发后绑定
		 * @param {string} 触发的事件名
		 * @param {object} 触发时的数据，可省略
		 */
		fire: function(type, data) {
			data = data || {};
			var o = this._lib[id + type];
			if(o.tag != BINDED) {
				if(o.list) {
					o.list.push(data);
				}
				else {
					o.list = [data];
				}
			}
			else {
				this._node.trigger(id + type, data);
			}
		}
	};

	//默认的全局事件驱动对象
	$$.event = new $$.Event();

})();