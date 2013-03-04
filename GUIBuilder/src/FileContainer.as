package
{
	import flash.desktop.NativeApplication;
	import flash.desktop.NativeProcess;
	import flash.desktop.NativeProcessStartupInfo;
	import flash.display.Sprite;
	import flash.events.ProgressEvent;
	import flash.filesystem.File;
	
	public class FileContainer extends Sprite
	{
		private var 列表:Vector.<UIFile>;
		private var 哈希:Object;
		private var 控制台:MsgField;
		private var 消息框:MsgBox;
		private var 配置:Config;
		private var java:File;
		private var nativeProcessStartupInfo:NativeProcessStartupInfo;
		
		public function FileContainer(控制台:MsgField, 消息框:MsgBox, 配置:Config)
		{
			this.控制台 = 控制台;
			this.消息框 = 消息框;
			this.配置 = 配置;
			列表 = new Vector.<UIFile>();
			哈希 = new Object();
		}
		
		public function 添加(file:File):void {
			if(!哈希[file.url]) {
				var uiFile:UIFile = new UIFile(this, file, stage.stageWidth - 20, 列表.length % 2 == 1);
				uiFile.y = 列表.length * UIFile.H;
				addChild(uiFile);
				列表.push(uiFile);
				哈希[file.url] = true;
			}
		}
		public function 添加多文件(files:Array):void {
			files.forEach(function(file:File, index:int, array:Array):void {
				添加(file);
			});
		}
		
		public function 构建(压缩:Boolean = true):void {
			列表.forEach(function(文件:UIFile, index:int, vector:Vector.<UIFile>):void {
				if(文件.状态) {
					构建单个(文件, 压缩);
				}
			});
		}
		public function 构建单个(文件:UIFile, 压缩:Boolean = true):void {
			if(java == null) {
				java = new File(配置.java);
				trace(java.nativePath);
				NativeApplication.nativeApplication.autoExit = true;
				nativeProcessStartupInfo = new NativeProcessStartupInfo();
				nativeProcessStartupInfo.executable = java;
			}
			控制台.清空();
			trace('buid');
			var process:NativeProcess = new NativeProcess();
			var v:Vector.<String> = new Vector.<String>();
			v.push("-jar");
			v.push(配置.fe);
			v.push("cssroot=" + 配置.css);
			v.push("jsroot=" + 配置.js);
			v.push("in=" + 文件.路径);
			v.push("ignore=" + 配置.全局id.replace(/\s+/g, "|"));
			if(压缩) {
				v.push("compress=true");
			}
			trace(v);
			nativeProcessStartupInfo.arguments = v;
			var i:int = 0;
			process.addEventListener(ProgressEvent.STANDARD_OUTPUT_DATA, function(event:ProgressEvent):void {
				var s:String = process.standardOutput.readMultiByte(process.standardOutput.bytesAvailable, "gbk");
				s = s.replace(/\r\n/g, "\n");
				trace(s);
				控制台.追加(s);
			});
			process.addEventListener(ProgressEvent.STANDARD_ERROR_DATA, function(event:ProgressEvent):void {
				var s:String = process.standardError.readMultiByte(process.standardError.bytesAvailable, "gbk");
				s = s.replace(/\r\n/g, "\n");
				trace(s);
				控制台.追加错误(s);
			});
			process.start(nativeProcessStartupInfo);
		}
		public function 压缩():void {
			列表.forEach(function(文件:UIFile, index:int, vector:Vector.<UIFile>):void {
				if(文件.状态) {
					压缩单个(文件);
				}
			});
		}
		public function 压缩单个(文件:UIFile):void {
			if(java == null) {
				java = new File(配置.java);
				trace(java.nativePath);
				NativeApplication.nativeApplication.autoExit = true;
				nativeProcessStartupInfo = new NativeProcessStartupInfo();
				nativeProcessStartupInfo.executable = java;
			}
			控制台.清空();
			trace('buid');
			var process:NativeProcess = new NativeProcess();
			var v:Vector.<String> = new Vector.<String>();
			v.push("-jar");
			v.push(配置.fe);
			v.push("cssroot=" + 配置.css);
			v.push("jsroot=" + 配置.js);
			v.push("in=" + 文件.路径);
			v.push("ignore=" + 配置.全局id.replace(/\s+/g, "|"));
			v.push("charset=" + 配置.编码.replace(/^\s+/g, "").replace(/\s+$/g, ""));
			v.push("onlycompress=true");
			trace(v);
			nativeProcessStartupInfo.arguments = v;
			var i:int = 0;
			process.addEventListener(ProgressEvent.STANDARD_OUTPUT_DATA, function(event:ProgressEvent):void {
				var s:String = process.standardOutput.readMultiByte(process.standardOutput.bytesAvailable, "gbk");
				s = s.replace(/\r\n/g, "\n");
				trace(s);
				控制台.追加(s);
			});
			process.addEventListener(ProgressEvent.STANDARD_ERROR_DATA, function(event:ProgressEvent):void {
				var s:String = process.standardError.readMultiByte(process.standardError.bytesAvailable, "gbk");
				s = s.replace(/\r\n/g, "\n");
				trace(s);
				控制台.追加错误(s);
			});
			process.start(nativeProcessStartupInfo);
		}
		public function 删除单个(文件:UIFile):void {
			trace(文件.路径);
			delete 哈希[文件.原始文件.url];
			var i:int = 列表.indexOf(文件);
			列表.splice(i, 1);
			for(; i < 列表.length; i++) {
				列表[i].切换();
				列表[i].y -= UIFile.H;
			}
			removeChild(文件);
		}
		public function 重置():void {
			graphics.clear();
			graphics.beginFill(0xF9F9F9);
			graphics.drawRect(0, 0, stage.stageWidth - 20, stage.stageHeight >> 1);
			graphics.endFill();
		}
	}
}