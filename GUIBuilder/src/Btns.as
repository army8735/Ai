package
{
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	
	public class Btns extends Sprite
	{
		private var 文件列表:FileContainer;
		private var 构建:Btn;
		private var 打包:Btn;
		private var 压缩:Btn;
		
		public function Btns(文件列表:FileContainer)
		{
			this.文件列表 = 文件列表;
			
			构建 = new Btn("构建");
			构建.x = 20;
			构建.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
				文件列表.构建();
			});
			addChild(构建);
			
			打包 = new Btn("打包");
			打包.x = 120;
			打包.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
				文件列表.构建(false);
			});
			addChild(打包);
			
			压缩 = new Btn("压缩");
			压缩.x = 220;
			压缩.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
				文件列表.压缩();
			});
			addChild(压缩);
		}
		
		public function 重置():void {
			构建.y = 打包.y = 压缩.y = stage.stageHeight - 37;
		}
	}
}