(function() {

	var _cache, //所有点击请求都缓存至此队列
		_url, //请求的url
		_interval = 0, //同一节点连续点击多少ms内忽略
		_delay = 0, //请求缓存多久再发送，以便合并相邻的两个请求
		_max = 0, //合并上限s
		_lastNode, //上次点击的节点
		_lastDate, //上次点击的时间
		_timeout, //缓存发送计时器
		COOKIE = 'g_click_count';
	function init(url, interval, delay, max) {
		_cache = [];
		reset(url, interval, delay, max, false);
		//只为页面可点击元素a和input做统计
		$(document.body).bind('click', function(event) {
			var p = event.target,
				res = [],
				cookie = false;
			//防止连续快速点击同一元素
			if(check(p)) {
				return;
			}
			//记录本次节点与时间
			_lastNode = p;
			_lastDate = +new Date();
			//图片点击查看父元素是否是a标签，才计算统计
			if(p.nodeName == 'IMG') {
				p = p.parentNode;
			}
			if(p.nodeName == 'A') {
				var href = $(p).attr('href'),
					target = $(p).attr('target');
				//真正的url链接并且是本窗口打开时，将计算后保存信息在cookie中，新页面读取cookie发送请求
				if(href.charAt(0) != '#' && (target == '' || target == '_self')) {
					cookie = true;
				}
			}
			//只有a和input标签才统计
			if(['A', 'INPUT'].indexOf(p.nodeName) > -1) {
				var temp;
				while(p && p != this) {
					//当有id属性时可直接返回
					temp = p.id;
					if(temp) {
						res.push('#' + temp);
						break;
					}
					temp = getIndex(p);
					//绝大多数情况下位置索引都不会超过32，因此记录32进制1位数足够，超过的话两边补_
					if(temp.length > 1) {
						res.push('_' + temp + '_');
					}
					else {
						res.push(temp);
					}
					p = p.parentNode;
				}
				if(res.length) {
					_cache.push(res.reverse().join(''));
					if(cookie) {
						$.cookie(COOKIE, _cache.join('|'));
					}
					else {
						//当缓存过长时立刻发送
						if(_cache.length > _max) {
							request();
						}
						//否则开始计时
						else {
							start();
						}
					}
				}
			}
		});
		//读取页面cookie，如果有链接跳转的cookie则开始计时发送
		var c = $.cookie(COOKIE);
		if(c) {
			_cache.push(c);
			$.cookie(COOKIE, null);
			start();
		}
	};
	function check(node) {
		if(_lastNode && _lastNode == node && (+new Date() - _lastDate < _interval)) {
			return true;
		}
		return false;
	}
	function getIndex(node) {
		var index = -1;
		while(node) {
			//只计算node_element节点，并且忽略掉一些无需计算的
			if(node.nodeType == 1 && ['SCRIPT', 'STYLE', 'OBJECT', 'EMBED'].indexOf(node.nodeName) == -1) {
				index++;
			}
			node = node.previousSibling;
		}
		return parseInt(index).toString(32);
	};
	function reset(url, interval, delay, max, request) {
		_url = url;
		_interval = interval;
		_delay = delay;
		_max = max;
		//重设过后要重新计时
		if(request) {
			start();
		}
	};
	function start() {
		//先清除原先的计时
		if(_timeout) {
			clearTimeout(_timeout);
		}
		_timeout = setTimeout(request, _delay);
	};
	function request() {
		//有数据时才会发送
		if(_cache.length) {
			$$.getRequest(_url, 'c=' + _cache.join('|'));
			_cache = [];
		}
	};
	$$.mix({
		/**
		 * @public 页面区域点击统计
		 * @{string} 统计请求url
		 * @{int} 同一点击多少ms内将忽略
		 * @{int} 统计将延迟多久发送，以便多个连续统计合并
		 * @{int} 合并上限，到达后将直接发送
		 */
		nodeClick: function(url, interval, delay, max) {
			if(_cache) {
				reset(url, interval, delay, max, true);
			}
			else {
				init(url, interval, delay, max);
			}
		}
	}, 'count');

})();