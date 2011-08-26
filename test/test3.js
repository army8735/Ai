define('test3.js', ['hello.js'], function(require, exports, module) {
	exports.test = 3;
	console.log(module);
});