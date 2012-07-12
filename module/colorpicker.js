define(['Event'], function(Event) {
	var data = [
			['0a0a0a', '130101', '130501', '130901', '130e01', '131201', '101301', '0c1301', '071301', '031301', '011303', '011307', '01130c', '011310', '011213', '010e13', '010913', '010513', '010113', '050113', '090113', '0e0113', '120113', '130110', '13010c', '130107'],
			['141414', '270101', '270a01', '271301', '271c01', '272501', '202701', '172701', '0e2701', '062701', '012706', '01270e', '012717', '012720', '012527', '011c27', '011327', '010a27', '010127', '0a0127', '130127', '1c0127', '250127', '270120', '270117', '27010e'],
			['1e1e1e', '3a0202', '3a0f02', '3a1c02', '3a2a02', '3a3702', '303a02', '233a02', '163a02', '083a02', '023a08', '023a16', '023a23', '023a30', '02373a', '022a3a', '021c3a', '020f3a', '02023a', '0f023a', '1c023a', '2a023a', '37023a', '3a0230', '3a0223', '3a0216'],
			['282828', '4e0202', '4e1402', '4e2602', '4e3802', '4e4902', '404e02', '2f4e02', '1d4e02', '0b4e02', '024e0b', '024e1d', '024e2f', '024e40', '02494e', '02384e', '02264e', '02144e', '02024e', '14024e', '26024e', '38024e', '49024e', '4e0240', '4e022f', '4e021d'],
			['323232', '610303', '611903', '612f03', '614503', '615c03', '506103', '3a6103', '246103', '0e6103', '03610e', '036124', '03613a', '036150', '035c61', '034561', '032f61', '031961', '030361', '190361', '2f0361', '450361', '5c0361', '610350', '61033a', '610324'],
			['3c3c3c', '740404', '741e04', '743904', '745304', '746e04', '617404', '467404', '2b7404', '117404', '047411', '04742b', '047446', '047461', '046e74', '045374', '043974', '041e74', '040474', '1e0474', '390474', '530474', '6e0474', '740461', '740446', '74042b'],
			['464646', '880404', '882304', '884204', '886104', '888004', '718804', '528804', '338804', '148804', '048814', '048833', '048852', '048871', '048088', '046188', '044288', '042388', '040488', '230488', '420488', '610488', '800488', '880471', '880452', '880433'],
			['505050', '9b0505', '9b2805', '9b4c05', '9b6f05', '9b9205', '819b05', '5d9b05', '3a9b05', '169b05', '059b16', '059b3a', '059b5d', '059b81', '05929b', '056f9b', '054c9b', '05289b', '05059b', '28059b', '4c059b', '6f059b', '92059b', '9b0581', '9b055d', '9b053a'],
			['5a5a5a', 'af0505', 'af2d05', 'af5505', 'af7d05', 'afa505', '91af05', '69af05', '41af05', '19af05', '05af19', '05af41', '05af69', '05af91', '05a5af', '057daf', '0555af', '052daf', '0505af', '2d05af', '5505af', '7d05af', 'a505af', 'af0591', 'af0569', 'af0541'],
			['646464', 'c20606', 'c23206', 'c25e06', 'c28b06', 'c2b706', 'a1c206', '75c206', '48c206', '1cc206', '06c21c', '06c248', '06c275', '06c2a1', '06b7c2', '068bc2', '065ec2', '0632c2', '0606c2', '3206c2', '5e06c2', '8b06c2', 'b706c2', 'c206a1', 'c20675', 'c20648'],
			['6e6e6e', 'd60606', 'd63706', 'd66806', 'd69906', 'd6c906', 'b1d606', '80d606', '50d606', '1fd606', '06d61f', '06d650', '06d680', '06d6b1', '06c9d6', '0699d6', '0668d6', '0637d6', '0606d6', '3706d6', '6806d6', '9906d6', 'c906d6', 'd606b1', 'd60680', 'd60650'],
			['787878', 'e90707', 'e93c07', 'e97107', 'e9a707', 'e9dc07', 'c1e907', '8ce907', '57e907', '22e907', '07e922', '07e957', '07e98c', '07e9c1', '07dce9', '07a7e9', '0771e9', '073ce9', '0707e9', '3c07e9', '7107e9', 'a707e9', 'dc07e9', 'e907c1', 'e9078c', 'e90757'],
			['828282', 'f80c0c', 'f8440c', 'f87b0c', 'f8b20c', 'f8ea0c', 'cef80c', '97f80c', '5ff80c', '28f80c', '0cf828', '0cf85f', '0cf897', '0cf8ce', '0ceaf8', '0cb2f8', '0c7bf8', '0c44f8', '0c0cf8', '440cf8', '7b0cf8', 'b20cf8', 'ea0cf8', 'f80cce', 'f80c97', 'f80c5f'],
			['8c8c8c', 'f82020', 'f85320', 'f88620', 'f8b920', 'f8ec20', 'd2f820', '9ff820', '6cf820', '39f820', '20f839', '20f86c', '20f89f', '20f8d2', '20ecf8', '20b9f8', '2086f8', '2053f8', '2020f8', '5320f8', '8620f8', 'b920f8', 'ec20f8', 'f820d2', 'f8209f', 'f8206c'],
			['969696', 'f93333', 'f96233', 'f99033', 'f9bf33', 'f9ed33', 'd6f933', 'a7f933', '79f933', '4af933', '33f94a', '33f979', '33f9a7', '33f9d6', '33edf9', '33bff9', '3390f9', '3362f9', '3333f9', '6233f9', '9033f9', 'bf33f9', 'ed33f9', 'f933d6', 'f933a7', 'f93379'],
			['a0a0a0', 'f94747', 'f97147', 'f99b47', 'f9c547', 'f9ef47', 'daf947', 'b0f947', '86f947', '5cf947', '47f95c', '47f986', '47f9b0', '47f9da', '47eff9', '47c5f9', '479bf9', '4771f9', '4747f9', '7147f9', '9b47f9', 'c547f9', 'ef47f9', 'f947da', 'f947b0', 'f94786'],
			['aaaaaa', 'fa5a5a', 'fa805a', 'faa55a', 'facb5a', 'faf15a', 'defa5a', 'b8fa5a', '92fa5a', '6dfa5a', '5afa6d', '5afa92', '5afab8', '5afade', '5af1fa', '5acbfa', '5aa5fa', '5a80fa', '5a5afa', '805afa', 'a55afa', 'cb5afa', 'f15afa', 'fa5ade', 'fa5ab8', 'fa5a92'],
			['b4b4b4', 'fb6d6d', 'fb8f6d', 'fbb06d', 'fbd16d', 'fbf26d', 'e2fb6d', 'c0fb6d', '9ffb6d', '7efb6d', '6dfb7e', '6dfb9f', '6dfbc0', '6dfbe2', '6df2fb', '6dd1fb', '6db0fb', '6d8ffb', '6d6dfb', '8f6dfb', 'b06dfb', 'd16dfb', 'f26dfb', 'fb6de2', 'fb6dc0', 'fb6d9f'],
			['bebebe', 'fb8181', 'fb9e81', 'fbba81', 'fbd781', 'fbf481', 'e6fb81', 'c9fb81', 'acfb81', '8ffb81', '81fb8f', '81fbac', '81fbc9', '81fbe6', '81f4fb', '81d7fb', '81bafb', '819efb', '8181fb', '9e81fb', 'ba81fb', 'd781fb', 'f481fb', 'fb81e6', 'fb81c9', 'fb81ac'],
			['c8c8c8', 'fc9494', 'fcad94', 'fcc594', 'fcdd94', 'fcf694', 'e9fc94', 'd1fc94', 'b9fc94', 'a0fc94', '94fca0', '94fcb9', '94fcd1', '94fce9', '94f6fc', '94ddfc', '94c5fc', '94adfc', '9494fc', 'ad94fc', 'c594fc', 'dd94fc', 'f694fc', 'fc94e9', 'fc94d1', 'fc94b9'],
			['d2d2d2', 'fca8a8', 'fcbca8', 'fcd0a8', 'fce3a8', 'fcf7a8', 'edfca8', 'd9fca8', 'c6fca8', 'b2fca8', 'a8fcb2', 'a8fcc6', 'a8fcd9', 'a8fced', 'a8f7fc', 'a8e3fc', 'a8d0fc', 'a8bcfc', 'a8a8fc', 'bca8fc', 'd0a8fc', 'e3a8fc', 'f7a8fc', 'fca8ed', 'fca8d9', 'fca8c6'],
			['dcdcdc', 'fdbbbb', 'fdcbbb', 'fddabb', 'fdeabb', 'fdf9bb', 'f1fdbb', 'e2fdbb', 'd2fdbb', 'c3fdbb', 'bbfdc3', 'bbfdd2', 'bbfde2', 'bbfdf1', 'bbf9fd', 'bbeafd', 'bbdafd', 'bbcbfd', 'bbbbfd', 'cbbbfd', 'dabbfd', 'eabbfd', 'f9bbfd', 'fdbbf1', 'fdbbe2', 'fdbbd2'],
			['e6e6e6', 'fecece', 'fedace', 'fee5ce', 'fef0ce', 'fefbce', 'f5fece', 'eafece', 'dffece', 'd4fece', 'cefed4', 'cefedf', 'cefeea', 'cefef5', 'cefbfe', 'cef0fe', 'cee5fe', 'cedafe', 'cecefe', 'dacefe', 'e5cefe', 'f0cefe', 'fbcefe', 'fecef5', 'feceea', 'fecedf'],
			['f0f0f0', 'fee2e2', 'fee9e2', 'feefe2', 'fef6e2', 'fefce2', 'f9fee2', 'f2fee2', 'ecfee2', 'e5fee2', 'e2fee5', 'e2feec', 'e2fef2', 'e2fef9', 'e2fcfe', 'e2f6fe', 'e2effe', 'e2e9fe', 'e2e2fe', 'e9e2fe', 'efe2fe', 'f6e2fe', 'fce2fe', 'fee2f9', 'fee2f2', 'fee2ec']
		];
	function Klass(node, first) {
		Event.call(this);
		this.node = $(node);
		this._init(first);
	}
	$$.inheritPrototype(Klass, Event);
	Klass.prototype._init = function(first) {
		var self = this,
			ul = $('<ul>');
		data[0].forEach(function(d) {
				var li = $('<li>');
				li.css('background-color', '#000');
				ul.append(li);
		});
		data.forEach(function(arr) {
			arr.forEach(function(d) {
				var li = $('<li>');
				li.css('background-color', '#' + d);
				ul.append(li);
			});
		});
		data[0].forEach(function(d) {
				var li = $('<li>');
				li.css('background-color', '#fff');
				ul.append(li);
		});
		ul.delegate('li', 'click', function(e) {
			var li = $(e.target),
				left = Math.floor((li.offset().left - ul.offset().left) / 6),
				top = Math.floor((li.offset().top - ul.offset().top) / 6),
				color;
			if(top == 0)
				color = '#000000';
			else if(top > data.length)
				color = '#ffffff';
			else
				color = '#' + data[top - 1][left];
			self.trigger('change:color', color);
		});
		this.node.append(ul);
		first = first || '#';
		if(first.charAt(0) == '#')
			first = first.slice(1);
		if(first.length == 3) {
			var s = first.split(''),
				res = [];
			s.forEach(function(c) {
				res.push(c);
			});
			first = res.join('');
		}
	}
	return Klass;
});