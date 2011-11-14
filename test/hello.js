define(true, 'temp', {
	'temp': 1
});

define(['test', 'test2.js'], function() {
	return {
		hello: 'hello'
	}
});