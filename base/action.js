(function() {

	var action = {}; //管理action，用以事件驱动

	$$.mix({

		/**
		 * @public 定义/执行action，和do无先后顺序
		 * @param {string} key
		 * @param {func} func
		 * @param {boolean} 是否覆盖掉已有的action，还是组合起来，默认false
		 */
		action: function(key, func, overwrite) {
			//未定义action或强制覆盖时，存入队列中等待do的调用
			if($.isUndefined(action[key]) || overwrite) {
				action[key] = {
					did: 0, //0标识尚未调用do，1是do过
					list: [func]
				};
			}
			else {
				//已定义则放入此action队列
				action[key].list.push(func);
				//倘若已经do过，直接执行
				if(action[key].did) {
					func.apply(null, action[key].args || []);
				}
			}
			return this;
		},
		
		/**
		 * @public 定义/执行action，和action无先后顺序
		 * @param {string/array/hash} 需要do的key，如果是array则是一组key，hash则是object的key
		 * @param * 每个事件驱动执行的参数
		 */
		does: function(key, args) {
			args = $.makeArray(args) || Array.prototype.slice.call(arguments, 1);
			if($.isArray(key)) {
				key.forEach(function(item) {
					$$.does(item, args);
				});
			}
			else if($.isPlainObject(key)) {
				this.keys(key).forEach(function(item) {
					//hash配置的值必须为true时才会执行
					if(key[item]) {
						$$.does(item, args);
					}
				});
			}
			else {
				var act = action[key];
				//cancel掉了设为null，拥有最高优先级
				if(act === null) {
				}
				//调用时不存在队列说明还未声明action，将此action初始化并且did设为1，让action自动调用
				else if($.isUndefined(act)) {
					action[key] = {
						did: 1,
						list: [],
						args: args
					};
				}
				//已定义action，遍历list
				else {
					action[key].did = 1;
					act.list.forEach(function(fn) {
						fn.apply(null, args);
					});
				}
			}
			return this;
		},
		
		/**
		 * @public取消执行已定义的action，必须在定义的动作真正执行前执行，拥有最高优先级，取消后此动作永不执行
		 * @param {string/array/hash} 需要cancel的key，如果是array则是一组key，hash则是object的key
		 */
		cancel: function(key) {
			var list = [];
			if($.isArray(key)) {
				list = key;
			}
			else if($.isPlainObject(key)) {
				this.keys(key).forEach(function(item) {
					list.push(key);
				});
			}
			else {
				list.push(key);
			}
			//设为null使得后续中无论does还是action都不再执行
			list.forEach(function(item) {
				action[item] = null;
			});
			return this;
		}
	});

})();