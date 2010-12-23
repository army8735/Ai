(function() {

	var action = {}; //管理action，用以多个页面共享一个js时执行里面的独立任务

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
					func();
				}
			}
		},
		
		/**
		 * @public 定义/执行action，和action无先后顺序
		 * @param {string/array/hash} 需要do的key，如果是array则是一组key，hash则是object的key
		 * @param {boolean} 如果已经do过，再次do是否重复此action列表，默认false
		 */
		does: function(key, repeat) {
			if($.isArray(key)) {
				key.forEach(function(item) {
					$$.does(item, repeat);
				});
			}
			else if($.isPlainObject(key)) {
				this.keys(key).forEach(function(item) {
					//hash配置的值必须为true时才会执行
					if(key[item]) {
						$$.does(item, repeat);
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
						list: []
					};
				}
				//已定义action或者强制执行时，遍历list
				else if(!act.did || repeat) {
					action[key].did = 1;
					act.list.forEach(function(fn) {
						fn();
					});
				}
			}
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
		}
	});

})();