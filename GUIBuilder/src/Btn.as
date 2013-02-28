package
{
	import flash.display.SimpleButton;
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	public class Btn extends SimpleButton
	{
		public function Btn(文字:String = "")
		{
			[Embed(source="/img/normal.png")]
			var 普通:Class;
			[Embed(source="/img/hover.png")]
			var 移入:Class;
			[Embed(source="/img/down.png")]
			var 按下:Class;
			
			var 样式:TextFormat = new TextFormat();
			样式.font = "宋体";
			样式.align = TextFormatAlign.CENTER;
			
			var 普通文本:TextField = new TextField();
			普通文本.defaultTextFormat = 样式;
			普通文本.y = 8;
			普通文本.text = 文字;
			
			var 移入文本:TextField = new TextField();
			移入文本.defaultTextFormat = 样式;
			移入文本.y = 8;
			移入文本.text = 文字;
			
			var 按下文本:TextField = new TextField();
			按下文本.defaultTextFormat = 样式;
			按下文本.y = 8;
			按下文本.text = 文字;
			
			var 普通显示:Sprite = new Sprite();
			普通显示.addChild(new 普通());
			普通文本.width = 普通显示.width;
			普通显示.addChild(普通文本);
			
			var 移入显示:Sprite = new Sprite();
			移入显示.addChild(new 移入());
			移入文本.width = 移入显示.width;
			移入显示.addChild(移入文本);
			
			var 按下显示:Sprite = new Sprite();
			按下显示.addChild(new 按下());
			按下文本.width = 按下显示.width;
			按下显示.addChild(按下文本);

			super(普通显示, 移入显示, 按下显示, 按下显示);
		}
	}
}