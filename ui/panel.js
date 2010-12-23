(function() {
	var panel;
	$$.mix({
		panel: function(s) {
			//已生成过panel，并且未调用remove方法将其彻底移除，则显示原先隐藏起来的panel
			if(panel) {
				panel.open();
				return panel;
			}
			var node,
				p,
tpl = [
	'<div id="gPanel">',
	'<div class="panel">sdf<br/>sod<br/>if</div>',
	'</div>'
].join('');
			node = $($$.render(tpl));
			p = $('div:first', node);
			node.appendTo($(document.body));
			panel = {
				open: function() {
					p.css('top', parseInt(p.height() * -0.5) + 'px');
					node.css('visibility', 'visible');
				},
				close: function() {
				},
				remove: function() {
				},
				node: function() {
					return node;
				}
			};
			panel.open();
			return panel;
		}
	}, 'ui');
})();