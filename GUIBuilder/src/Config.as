package
{
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileStream;
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.filesystem.FileMode;
	
	public class Config extends Sprite
	{
		private var 蒙层:Sprite;
		private var 背景:Sprite;
		private var 关闭:Sprite;
		private var 保存:Sprite;
		private var 说明:TextField;
		private var java程序:ConfigItem;
		private var fe包:ConfigItem;
		private var css根目录:ConfigItem;
		private var js根目录:ConfigItem;
		private var ignore:ConfigItem;
		private var 消息框:MsgBox;
		
		public function Config(消息框:MsgBox)
		{
			visible = false;
			this.消息框 = 消息框;
			
			蒙层 = new Sprite();
			蒙层.alpha = 0.1;
			addChild(蒙层);
			
			背景 = new Sprite();
			背景.alpha = 0.8;
			背景.graphics.beginFill(0xFFFFFF);
			背景.graphics.drawRoundRect(0, 0, 500, 300, 10);
			背景.graphics.endFill();
			addChild(背景);

			[Embed(source="/img/close.png")]
			var 图标:Class;
			关闭 = new Sprite();
			关闭.buttonMode  = true;
			关闭.addChild(new 图标());
			关闭.alpha = 0.5;
			关闭.addEventListener(MouseEvent.ROLL_OVER, function(event:MouseEvent):void {
				关闭.alpha = 1;
			});
			关闭.addEventListener(MouseEvent.ROLL_OUT, function(event:MouseEvent):void {
				关闭.alpha = 0.5;
			});
			关闭.addEventListener(MouseEvent.CLICK, 关闭句柄);
			addChild(关闭);
			
			[Embed(source="/img/ok.png")]
			var 图标2:Class;
			保存 = new Sprite();
			保存.buttonMode = true;
			保存.addChild(new 图标2());
			保存.alpha = 0.5;
			保存.addEventListener(MouseEvent.ROLL_OVER, function(event:MouseEvent):void {
				保存.alpha = 1;
			});
			保存.addEventListener(MouseEvent.ROLL_OUT, function(event:MouseEvent):void {
				保存.alpha = 0.5;
			});
			保存.addEventListener(MouseEvent.CLICK, 保存句柄);
			addChild(保存);
			
			var 标题样式:TextFormat = new TextFormat();
			标题样式.font = "宋体";
			标题样式.bold = true;
			
			说明 = new TextField();
			说明.defaultTextFormat = 标题样式;
			说明.text = "以下配置只需首次进行一次即可：";
			说明.width = 说明.textWidth + 4;
			addChild(说明);
			
			java程序 = new ConfigItem("java.exe", true, "java.exe");
			addChild(java程序);
			fe包 = new ConfigItem("FeBuilder.jar", true, "FeBuilder.jar");
			addChild(fe包);
			css根目录 = new ConfigItem("css根目录", true);
			addChild(css根目录);
			js根目录 = new ConfigItem("js根目录", true);
			addChild(js根目录);
			ignore = new ConfigItem("忽略模块id");
			addChild(ignore);
			
			初始化();
			
		}
		
		private function 保存句柄(event:MouseEvent):void {
			if(检测()) {
				消息框.显示消息("保存配置文件。");
				var v:Vector.<String> = new Vector.<String>();
				v.push("java=" + java程序.路径);
				v.push("fe=" + fe包.路径);
				v.push("css=" + css根目录.路径);
				v.push("js=" + js根目录.路径);
				v.push("ignore=" + ignore.路径);
				var 存储文件:File = File.applicationStorageDirectory.resolvePath("config.txt");
				var 文件流:FileStream = new FileStream();
				文件流.open(存储文件, FileMode.WRITE);
				文件流.writeUTF(v.join("\n"));
				文件流.close();
				visible = false;
			}
			else {
				消息框.显示错误("必须先完成配置！");
			}
		}
		private function 关闭句柄(event:MouseEvent):void {
			if(检测()) {
				visible = false;
			}
			else {
				消息框.显示错误("必须先完成配置！");
			}
		}
		private function 检测():Boolean {
			return java程序.路径 != '' && fe包.路径 != '' && css根目录.路径 != '' && js根目录.路径 != '';
		}
		private function 初始化():void {
			var 存储文件:File = File.applicationStorageDirectory.resolvePath("config.txt");
			var 文件流:FileStream = new FileStream();
			if(存储文件.isDirectory) {
				存储文件.deleteDirectory(true);
			}
			if(!存储文件.exists) {
				文件流.open(存储文件, FileMode.WRITE);
				文件流.writeInt(0);
				文件流.close();
			}
			消息框.显示消息("读取配置文件。");
			文件流.open(存储文件, FileMode.READ);
			var s:String = 文件流.readUTF();
			trace(s);
			var v:Array = s.split("\n");
			v.forEach(function(s:String, index:int, array:Array):void {
				if(s.indexOf("java=") == 0) {
					java程序.路径 = s.slice(5);
				}
				else if(s.indexOf("fe=") == 0) {
					fe包.路径 = s.slice(3);
				}
				else if(s.indexOf("css=") == 0) {
					css根目录.路径 = s.slice(4);
				}
				else if(s.indexOf("js=") == 0) {
					js根目录.路径 = s.slice(3);
				}
				else if(s.indexOf("ignore=") == 0) {
					ignore.路径 = s.slice(7);
				}
			});
			文件流.close();
			if(!检测()) {
				消息框.显示消息("首次运行需要先配置。");
				visible = true;
			}
		}

		public function get java():String {
			return java程序.路径;
		}
		public function get fe():String {
			return fe包.路径;
		}
		public function get css():String {
			return css根目录.路径;
		}
		public function get js():String {
			return js根目录.路径;
		}
		public function get 全局id():String {
			return ignore.路径;
		}
		public function 重置():void {
			蒙层.graphics.clear();
			蒙层.graphics.beginFill(0);
			蒙层.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
			蒙层.graphics.endFill();
			背景.x = (stage.stageWidth - 背景.width) >> 1;
			背景.y = (stage.stageHeight - 背景.height) >> 1;
			说明.x = 背景.x + 15;
			说明.y = 背景.y + 15;
			java程序.x = 说明.x + 20;
			java程序.y = 说明.y + 50;
			fe包.x = 说明.x + 20;
			fe包.y = java程序.y + 30;
			css根目录.x = 说明.x + 20;
			css根目录.y = fe包.y + 30;
			js根目录.x = 说明.x + 20;
			js根目录.y = css根目录.y + 30;
			ignore.x = 说明.x + 20;
			ignore.y = js根目录.y + 30;
			保存.x = 说明.x + 200;
			保存.y = 背景.y + 背景.height - 60;
			关闭.x = 保存.x + 50;
			关闭.y = 保存.y;
		}
	}
}