define(true, 'temp', {
	'temp': 1
});

define(['test.js', 'test2.js'], function() {
	return {
		hello: 'hello'
	}
});