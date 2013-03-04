package
{
	import flash.display.NativeMenu;
	import flash.display.NativeMenuItem;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.filesystem.File;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	public class UIFile extends Sprite
	{
		public static const H:int = 26;
		
		private var 文件:File;
		private var 名字:TextField;
		private var 是否选择:Boolean;
		private var 偶数行:Boolean;
		
		public function UIFile(文件列表:FileContainer, 文件:File, 宽度:int, 偶数行:Boolean = false)
		{
			this.文件 = 文件;
			this.偶数行 = 偶数行;
			buttonMode = true;
			
			名字 = new TextField();
			var 样式:TextFormat = new TextFormat();
			样式.font = "宋体";
			名字.defaultTextFormat = 样式;
			名字.text = 文件.url.substr(8);
			名字.width = 名字.textWidth + 4;
			名字.x = 30;
			名字.y = 5;
			addChild(名字);
			
			[Embed(source="/img/selected.png")]
			var 图标:Class;
			[Embed(source="/img/unselected.png")]
			var 图标2:Class;
			
			var 选中:Sprite = new Sprite();
			选中.x = 选中.y = 5;
			选中.addChild(new 图标());
			选中.visible = false;
			addChild(选中);
			var 未选:Sprite = new Sprite();
			未选.x = 未选.y = 5;
			未选.addChild(new 图标2());
			未选.alpha = 0.5;
			addChild(未选);
			
			背景色(宽度);
			
			addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
				var 样式:TextFormat = new TextFormat();
				if(状态) {
					选中.visible = false;
					未选.visible = true;
				}
				else {
					选中.visible = true;
					未选.visible = false;
				}
				状态 = !状态;
			});
			var self:UIFile = this;
			addEventListener(MouseEvent.MIDDLE_CLICK, function(event:MouseEvent):void {
				文件列表.构建单个(self);
			});
			addEventListener(MouseEvent.ROLL_OVER, function(event:MouseEvent):void {
				样式.color = 0xFF6600;
				名字.setTextFormat(样式);
			});
			addEventListener(MouseEvent.ROLL_OUT, function(event:MouseEvent):void {
				样式.color = 0;
				名字.setTextFormat(样式);
			});
			
			var 菜单:NativeMenu = new NativeMenu();
			var 构建:NativeMenuItem = new NativeMenuItem("构建");
			var 打包:NativeMenuItem = new NativeMenuItem("打包");
			var 压缩:NativeMenuItem = new NativeMenuItem("压缩");
			var 删除:NativeMenuItem = new NativeMenuItem("删除");
			
			构建.addEventListener(Event.SELECT, function(event:Event):void {
				文件列表.构建单个(self);
			});
			打包.addEventListener(Event.SELECT, function(event:Event):void {
				文件列表.构建单个(self, false);
			});
			压缩.addEventListener(Event.SELECT, function(event:Event):void {
				文件列表.压缩单个(self);
			});
			删除.addEventListener(Event.SELECT, function(event:Event):void {
				文件列表.删除单个(self);
			});
			
			菜单.addItem(构建);
			菜单.addItem(打包);
			菜单.addItem(压缩);
			菜单.addItem(删除);
			contextMenu = 菜单;
		}
		private function 背景色(宽度:int):void {
			if(偶数行) {
				graphics.beginFill(0xF9FFFF);
			}
			else {
				graphics.beginFill(0xFFFFFF);
			}
			graphics.drawRect(0, 0, 宽度, H);
			graphics.endFill();
		}
		
		public function 切换():void {
			偶数行 = !偶数行;
			背景色(stage.stageWidth);
		}
		public function get 原始文件():File {
			return 文件;
		}
		public function get 状态():Boolean {
			return 是否选择;
		}
		public function set 状态(值:Boolean):void {
			是否选择 = 值;
		}
		public function get 路径():String {
			return 名字.text;
		}
	}
}