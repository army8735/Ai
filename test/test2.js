define('test2.js', ['test3.js'], function(test3) {
	console.log(test3);
	console.log('test2');
});