package
{
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	public class MsgField extends Sprite
	{
		private var 文本框:TextField;
		private var 默认样式:TextFormat;
		private var 错误样式:TextFormat;
		
		public function MsgField()
		{
			文本框 = new TextField();
			文本框.multiline = true;
			默认样式 = new TextFormat();
			默认样式.font = "宋体";
			默认样式.color = 0x404040;
			文本框.defaultTextFormat = 默认样式;
			文本框.x = 10;
			文本框.y = 5;
			addChild(文本框);
			
			错误样式 = new TextFormat();
			错误样式.color = 0xFF0000;
		}
		
		public function 重置():void {
			graphics.clear();
			graphics.lineStyle(1, 0xA0A0A0);
			graphics.beginFill(0xFCFCFC);
			graphics.drawRoundRect(5, 0, stage.stageWidth - 10, (stage.stageHeight >> 1) - 40, 3);
			graphics.endFill();
			
			文本框.width = stage.stageWidth - 20;
			文本框.height = (stage.stageHeight >> 1) - 50;
			
			y = stage.stageHeight >> 1;
		}
		public function 追加(s:String):void {
			文本框.appendText(s);
			文本框.setTextFormat(默认样式, 文本框.text.length - s.length, 文本框.text.length);
			文本框.scrollV = 文本框.numLines;
		}
		public function 追加错误(s:String):void {
			文本框.appendText(s);
			文本框.setTextFormat(错误样式, 文本框.text.length - s.length, 文本框.text.length);
			文本框.scrollV = 文本框.numLines;
		}
		public function 清空():void {
			文本框.text = "";
		}
	}
}