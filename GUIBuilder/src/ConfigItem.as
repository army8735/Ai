package
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.filesystem.File;
	import flash.net.FileFilter;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	public class ConfigItem extends Sprite
	{
		private static const 标签样式:TextFormat = new TextFormat("宋体");
		标签样式.align = TextFormatAlign.RIGHT;
		标签样式.color = 0x808080;
		private static const 输入样式:TextFormat = new TextFormat("宋体");
		输入样式.color = 0x404040;
		[Embed(source="/img/open.png")]
		private var 图标:Class;
		
		private var 标签:TextField;
		private var 输入框:TextField;
		private var 按钮:Sprite;
		
		public function ConfigItem(标签文本:String, 需要文件:Boolean = false, 选择文件:String = null)
		{
			标签 = new TextField();
			标签.defaultTextFormat = 标签样式;
			标签.text = 标签文本;
			标签.width = 90;
			addChild(标签);
			
			输入框 = new TextField();
			输入框.type = TextFieldType.INPUT;
			输入框.defaultTextFormat = 输入样式;
			输入框.width = 300;
			输入框.height = 16;
			输入框.x = 100;
			输入框.border = true;
			输入框.borderColor = 0x808080;
			输入框.background = true;
			输入框.backgroundColor = 0xFFFFF9;
			addChild(输入框);

			if(需要文件) {
				按钮 = new Sprite();
				按钮.addChild(new 图标());
				按钮.buttonMode = true;
				按钮.x = 输入框.x + 输入框.width + 10;
				按钮.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
					var file:File = File.desktopDirectory;
					file.addEventListener(Event.SELECT, function(event:Event):void {
						输入框.text = decodeURI(file.url).substr(8);
					});
					if(选择文件 !== null) {
						file.browseForOpen("选择文件", [new FileFilter(选择文件, 选择文件)]);
					}
					else {
						file.browseForDirectory("选择" + 标签文本);
					}
				});
				addChild(按钮);
			}
			
		}
		
		public function get 路径():String {
			return 输入框.text;
		}
		public function set 路径(s:String):void {
			输入框.text = s;
		}
	}
}