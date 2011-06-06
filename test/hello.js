define('hello', ['test.js', 'test2.js'], function() {
	return {
		say: function() {
			console.log('hello');
		}
	}
});