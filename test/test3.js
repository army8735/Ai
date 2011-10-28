define('test3.js', function() {
	exports.test = 3;
	console.log(require('test4.js'));
	console.log(module);
});