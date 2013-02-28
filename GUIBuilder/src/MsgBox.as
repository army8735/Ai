package
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.utils.Timer;
	
	public class MsgBox extends Sprite
	{
		private var 消息框:TextField;
		private var 计时器:Timer;
		
		public function MsgBox()
		{
			var 样式:TextFormat = new TextFormat();
			样式.font = "宋体";
			消息框 = new TextField();
			消息框.x = 1;
			消息框.height = 16;
			消息框.background = true;
			消息框.defaultTextFormat = 样式;
			addChild(消息框);
		}
		
		public function 显示消息(消息:String):void {
			消息框.backgroundColor = 0x99CCFF;
			设置(消息);
		}
		public function 显示错误(消息:String):void {
			消息框.backgroundColor = 0xFF9966;
			设置(消息);
		}
		private function 设置(消息:String):void {
			消息框.y = 0;
			消息框.htmlText = 消息;
			if(计时器) {
				计时器.stop();
			}
			removeEventListener(Event.ENTER_FRAME, 显示句柄);
			removeEventListener(Event.ENTER_FRAME, 隐藏句柄);
			addEventListener(Event.ENTER_FRAME, 显示句柄);
		}
		private function 显示句柄(event:Event):void {
			消息框.y -= 1;
			if(消息框.y <= -消息框.height) {
				removeEventListener(Event.ENTER_FRAME, 显示句柄);
				计时器 = new Timer(2000, 1);
				计时器.addEventListener(TimerEvent.TIMER_COMPLETE, function(event:TimerEvent):void {
					addEventListener(Event.ENTER_FRAME, 隐藏句柄);
				});
				计时器.start();
			}
		}
		private function 隐藏句柄(event:Event):void {
			消息框.y += 1;
			if(消息框.y >= 0) {
				removeEventListener(Event.ENTER_FRAME, 隐藏句柄);
			}
		}
		
		public function 重置():void {
			消息框.width = 消息框.textWidth + 4;
			y = stage.stageHeight;
		}
	}
}