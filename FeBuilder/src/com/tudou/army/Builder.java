package com.tudou.army;

import java.util.*;
import java.io.*;

public class Builder {
	public static String SVN头 = "\n * @url $URL$\n" +
			 " * @modified $Author$\n" +
			 " * @version $Rev$\n";
	public static String 默认头注释 = "/**" + SVN头 + " */\n";
	public static HashSet<String> 全局模块;
	
	public static void main(String[] args) {
		File css根路径 = null;
		File js根路径 = null;
		File 目标文件 = null;
		Boolean 是否压缩 = false;
		Boolean 仅压缩 = false;
		String 编码 = null;
		全局模块 = new HashSet<String>();
		//从args里获取配置
		for(String arg : args) {
			if(arg.startsWith("cssroot=")) {
				css根路径 = new File(arg.substring(8));
			}
			else if(arg.startsWith("jsroot=")) {
				js根路径 = new File(arg.substring(7));
			}
			else if(arg.startsWith("in=")) {
				目标文件 = new File(arg.substring(3));
			}
			else if(arg.startsWith("ignore=")) {
				for(String id : arg.substring(7).split("\\|")) {
					全局模块.add(id);
				}
			}
			else if(arg.startsWith("compress=")) {
				是否压缩 = (arg.equals("compress=true") || arg.equals("compress=1"));
			}
			else if(arg.startsWith("onlycompress=")) {
				仅压缩 = (arg.equals("onlycompress=true") || arg.equals("onlycompress=1"));
			}
			else if(arg.startsWith("charset=")) {
				编码 = arg.substring(8);
			}
		}
		if(css根路径 == null) {
			System.err.println("css根路径没配置");
		}
		if(!css根路径.exists()) {
			System.err.println("css根路径不存在: " + css根路径);
			return;
		}
		if(!css根路径.isDirectory()) {
			System.err.println("css根路径不是目录: " + css根路径);
			return;
		}
		if(js根路径 == null) {
			System.err.println("js根路径没配置");
		}
		if(!js根路径.exists()) {
			System.err.println("js根路径不存在: " + js根路径);
			return;
		}
		if(!js根路径.isDirectory()) {
			System.err.println("js根路径不是目录: " + js根路径);
			return;
		}
		if(目标文件 == null) {
			System.err.println("目标文件没配置");
		}
		构建文件(css根路径, js根路径, 目标文件, 是否压缩, 仅压缩, 编码);
		System.exit(1);
	}
	static void 构建文件(File css根路径, File js根路径, File 目标文件, Boolean 是否压缩, Boolean 仅压缩, String 编码) {
		if(!目标文件.exists()) {
			System.err.println(目标文件.getAbsolutePath() + "文件不存在");
			return;
		}
		if(目标文件.isDirectory()) {
			File[] list = 目标文件.listFiles();
			for(File f : list) {
				构建文件(css根路径, js根路径, f, 是否压缩, 仅压缩, 编码);
			}
			return;
		}
		if(!目标文件.isFile() || 目标文件.isHidden()) {
			System.err.println("目标文件异常");
			return;
		}
		String 文件名 = 目标文件.getName();
		if(仅压缩) {
			为文件添加默认头注释(目标文件);
			if(文件名.endsWith(".css")) {
				CssBuilder.压缩(目标文件, 编码);
			}
			else if(文件名.endsWith(".js")) {
				JsBuilder.压缩(目标文件, 编码);
			}
		}
		else {
			if(文件名.endsWith("_src.css")) {
				为文件添加默认头注释(目标文件);
				CssBuilder cssBuilder = new CssBuilder(css根路径, 目标文件, 是否压缩, 编码);
				cssBuilder.构建();
			}
			else if(文件名.endsWith("_src.js")) {
				为文件添加默认头注释(目标文件);
				JsBuilder jsBuilder = new JsBuilder(js根路径, 目标文件, 全局模块, 是否压缩, 编码);
				jsBuilder.构建();
			}
			else if(文件名.endsWith(".css") || 文件名.endsWith(".js")) {
				为文件添加默认头注释(目标文件);
			}
		}
	}
	static void 为文件添加默认头注释(File 目标文件) {
		BufferedReader br = null;
		String s = null;
		try {
			br = new BufferedReader(new FileReader(目标文件));
			StringBuilder sb = new StringBuilder();
			while((s = br.readLine()) != null) {
				sb.append(s);
				sb.append("\n");
			}
			s = sb.toString();
			if(!s.startsWith("/**")) {
				BufferedWriter bw = null;
				try {
					bw = new BufferedWriter(new FileWriter(目标文件));
					bw.write(默认头注释);
					bw.write(s);
					bw.close();
				} catch (IOException e) {
					e.printStackTrace();
				} finally {
					if(bw != null) {
						try {
							bw.close();
						} catch (IOException e) {
							//
						}
					}
				}
			}
		} catch(IOException e) {
			e.printStackTrace();
			System.exit(1);
		} finally {
			if(br != null) {
				try {
					br.close();
				} catch(IOException e) {
					//
				}
			}
		}
	}

}
