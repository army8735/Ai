package  
{
	import flash.desktop.ClipboardFormats;
	import flash.desktop.NativeDragManager;
	import flash.display.InteractiveObject;
	import flash.display.NativeMenu;
	import flash.display.NativeMenuItem;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.FileListEvent;
	import flash.events.NativeDragEvent;
	import flash.filesystem.File;
	import flash.net.FileFilter;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	public class GUIBuilder extends Sprite
	{
		private var 控制台:MsgField;
		private var 文件列表:FileContainer;
		private var 构建按钮:Sprite;
		private var 消息框:MsgBox;
		private var 配置:Config;
		private var 按钮:Btns;
		
		public function GUIBuilder()
		{
			visible = false;
			
			stage.frameRate = 30;
			stage.nativeWindow.title = "GUI构建";
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			初始化菜单();
			
			消息框 = new MsgBox();
			配置 = new Config(消息框);
			控制台 = new MsgField();
			文件列表 = new FileContainer(控制台, 消息框, 配置);
			按钮 = new Btns(文件列表);
			addChild(文件列表);
			addChild(控制台);
			addChild(按钮);
			addChild(配置);
			addChild(消息框);
			
			stage.addEventListener(Event.RESIZE, 重置);
			重置();
			
			stage.addEventListener(NativeDragEvent.NATIVE_DRAG_ENTER, 拖动进入);
			stage.addEventListener(NativeDragEvent.NATIVE_DRAG_DROP, 拖放);
			
			visible = true;
		}
		
		private function 初始化菜单():void {
			var 文件:NativeMenu = new NativeMenu();
			var 打开:NativeMenuItem = new NativeMenuItem("打开");
			打开.addEventListener(Event.SELECT, function(event:Event):void {
				var file:File = File.desktopDirectory;
				file.addEventListener(FileListEvent.SELECT_MULTIPLE, function(event:FileListEvent):void {
					文件列表.添加多文件(event.files);
				});
				file.browseForOpenMultiple("选择ui文件", [new FileFilter("css和js(*.css;*.js)", "*.css;*.js")]);
			});
			var 退出:NativeMenuItem = new NativeMenuItem("退出");
			退出.addEventListener(Event.SELECT, function(event:Event):void {
				stage.nativeWindow.close();
			});
			文件.addItem(打开);
			文件.addItem(退出);
			
			var 设置:NativeMenu = new NativeMenu();
			设置.addItem(new NativeMenuItem("设置"));
			设置.addEventListener(Event.SELECT, function(event:Event):void {
				配置.visible = true;
			});
			
			var 帮助:NativeMenu = new NativeMenu();
			帮助.addItem(new NativeMenuItem("MIT License"));
			var 链接:NativeMenuItem = new NativeMenuItem("view on git");
			链接.addEventListener(Event.SELECT, function(event:Event):void {
				navigateToURL(new URLRequest("https://github.com/army8735/Ai"));
			});
			帮助.addItem(链接);
			
			var 菜单:NativeMenu = new NativeMenu();
			菜单.addSubmenu(文件, "文件");
			菜单.addSubmenu(设置, "设置");
			菜单.addSubmenu(帮助, "帮助");
			
			stage.nativeWindow.menu = 菜单;
		}
		private function 重置(event:Event = null):void {
			控制台.重置();
			文件列表.重置();
			配置.重置();
			消息框.重置();
			按钮.重置();
		}
		private function 拖动进入(event:NativeDragEvent):void {
			if(event.clipboard.hasFormat(ClipboardFormats.FILE_LIST_FORMAT)) {
				NativeDragManager.acceptDragDrop(event.currentTarget as InteractiveObject);
			}
		}
		private function 拖放(event:NativeDragEvent):void {
			var files:Array = event.clipboard.getData(ClipboardFormats.FILE_LIST_FORMAT) as Array;
			文件列表.添加多文件(files);
		}
	}
}