A AMD Module Loader with a Builder by java & air
===

Sorry for only chinese comments...


## API

$$.join(key:String, url:String = null, force:Boolean = false):String
设置/读取加载url的路由映射。不传参时为返回整个映射库，只传key为返回其对应的映射关系；force指定是否强制覆盖原映射关系，不存在原时无需强制

$$.load(url:String, callback:Function = null, charset:String = null):void
加载url的script文件，成功/失败后回调callback，并且可指定文件的编码charset

$$.base(url:String = null):String
设置/读取加载根路径，默认为当前页面的url

$$.path(url:String, depend:String = null):String
根据depend获取url相对于其的绝对路径值，省略depend为相对$$.base()的值

define(id:String = null, dependencies:Array<String> = null, factory:Function/Object):void
CommonJS/AMD标准定义模块接口

require(mod:String):Object
CommonJS/AMD标准获取模块接口

require(mod:String, callback:Function, charset:String = null):void
CommonJS/AMD标准使用模块接口，增加了第3个charset参数可选编码

require():HashMap
获取全部模块信息，扩展接口

define.url(url:String):void
设定下一个模块的uri，扩展接口

## FeBuilder

need jre1.6+

java -jar FeBuilder.jar

jsroot= js域名根目录

cssroot= css域名根目录

in= 构建或压缩的文件路径

compress= true为构建后压缩

onlycompress= true为仅压缩

charset= 文件编码默认utf-8

ignore= 构建忽略的全局模块id


## GUIBuilder

need Adobe air2+

a GUI tool base on FeBuilder


## License

[MIT License]