package com.tudou.army;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import com.google.javascript.jscomp.CommandLineRunner;

public class JsBuilder {
	private File 根路径;
	private File 目标文件;
	private File 合并文件;
	private HashSet<String> 全局模块;
	private LinkedHashSet<File> 文件列表;
	private Boolean 是否压缩;
	private File 压缩文件;
	
	static final int 默认 = 0;
	static final int 导入 = 1;
	static final int 构建 = 2;
	static final int 依赖 = 3;

	public JsBuilder(File 根路径, File 目标文件, HashSet<String> 全局模块, Boolean 是否压缩) {
		this.根路径 = 根路径;
		this.目标文件 = 目标文件;
		this.全局模块 = 全局模块;
		this.是否压缩 = 是否压缩;
		String name = 目标文件.getName();
		合并文件 = new File(目标文件.getParent(), name.substring(0, name.length() - 7) + ".js");
		压缩文件 = new File(目标文件.getParent(), name.substring(0, name.length() - 7) + ".min.js");
		if(!合并文件.exists()) {
			try {
				合并文件.createNewFile();
			} catch (IOException e) {
				e.printStackTrace();
				System.exit(1);
			}
		}
		文件列表 = new LinkedHashSet<File>();
	}
	public void 构建() {
		StringBuilder 结果缓存 = new StringBuilder();
		递归导入文件(目标文件, 结果缓存, 默认);
		System.out.println("---Input:");
		for(File f : 文件列表) {
			System.out.println(f);
		}
		输出(结果缓存);
		System.out.println("---Output:");
		System.out.println(合并文件);
	}
	private void 递归导入文件(File 当前文件, StringBuilder 结果缓存, int 类型) {
		if(文件列表.contains(当前文件)) {
			return;
		}
		String 内容 = 提取文件内容(当前文件);
		String 头注释 = 提取头注释(内容);
		String 过滤注释内容 = 内容.substring(头注释.length());
		LinkedHashSet<File> 导入文件,  构建文件, 依赖文件 = null;
		boolean isModule = 是否模块(过滤注释内容);
		boolean isTpl = 是否模板(当前文件);
		//模板、模块文件、普通文件互斥
		if(isTpl) {
			//
		}
		else if(isModule) {
			String id = 获取模块ID(过滤注释内容);
			if((类型 == 依赖 || 类型 == 构建) && 全局模块.contains(id)) {
				return;
			}
			依赖文件 = 获取依赖文件(当前文件, 过滤注释内容);
			for(File f : 依赖文件) {
				递归导入文件(f, 结果缓存, 依赖);
			}
		}
		else {
			导入文件 = 获取头注释导入文件(当前文件, 头注释);
			for(File f : 导入文件) {
				递归导入文件(f, 结果缓存, 导入);
			}
			构建文件 = 获取构建文件(过滤注释内容);
			for(File f : 构建文件) {
				递归导入文件(f, 结果缓存, 构建);
			}
		}
		文件列表.add(当前文件);
		if(当前文件 != 目标文件) {
			头注释 = 头注释.replaceAll(" \\$", " ");
		}
		if(!isTpl) {
			结果缓存.append(头注释);
		}
		if(isModule) {
			结果缓存.append("\ndefine.url('");
			结果缓存.append(获取模块URI(当前文件));
			结果缓存.append("');");
		}
		if(isTpl) {
			结果缓存.append("define.url('");
			结果缓存.append(获取模块URI(当前文件));
			结果缓存.append("');");
			结果缓存.append("\ndefine('");
			过滤注释内容 = 过滤注释内容.replaceAll("[\r\n\t]", "");
		}
		结果缓存.append(过滤注释内容);
		if(isTpl) {
			结果缓存.append("');\n");
		}
	}
	private LinkedHashSet<File> 获取依赖文件(File 当前文件, String 过滤注释内容) {
		LinkedHashSet<File> 文件列表 = new LinkedHashSet<File>();
		//显示声明的依赖
		Pattern p = Pattern.compile("^\\s*define\\s*\\(\\s*\\[([^\\]{();]+)\\]");
		Matcher m = p.matcher(过滤注释内容);
		String s;
		if(m.find()) {
			s = m.group(1);
			p = Pattern.compile("(['\"])(.+?)\\1");
			m = p.matcher(s);
			while(m.find()) {
				s = m.group(2);
				if(!全局模块.contains(s)) {
					if(!s.endsWith(".js") && !s.endsWith(".tpl")) {
						s += ".js";
					}
					if(s.charAt(0) == '/') {
						文件列表.add(new File(根路径, s));
					}
					else {
						文件列表.add(new File(当前文件.getParent(), s));
					}
				}
			}
		}
		//隐式require的依赖require("module")，当显示有了时失效
		if(文件列表.size() == 0) {
			p = Pattern.compile("(?:^|[^.\\w])\\s*require\\s*\\(\\s*([\"'])(.+?)\\1");
			m = p.matcher(过滤注释内容);
			while(m.find()) {
				s = m.group(2);
				if(!全局模块.contains(s)) {
					if(!s.endsWith(".js") && !s.endsWith(".tpl")) {
						s += ".js";
					}
					if(s.charAt(0) == '/') {
						文件列表.add(new File(根路径, s));
					}
					else {
						文件列表.add(new File(当前文件.getParent(), s));
					}
				}
			}
		}
		return 文件列表;
	}
	private LinkedHashSet<File> 获取构建文件(String 过滤注释内容) {
		LinkedHashSet<File> 文件列表 = new LinkedHashSet<File>();
		Pattern p = Pattern.compile("(?:^|[^.\\w])\\s*require\\s*\\(([^(]+)");
		Matcher m = p.matcher(过滤注释内容);
		while(m.find()) {
			String s = m.group(1);
			if(s != null) {
				s = s.replaceAll("//@async[\\s\\S]+?([\"']).+?\\1", "");
				Pattern p2 = Pattern.compile("([\"'])(.+?)\\1");
				Matcher m2 = p2.matcher(s);
				while(m2.find()) {
					if(全局模块.contains(m2.group(2))) {
						continue;
					}
					s = m2.group(2);
					if(!s.endsWith(".js") && !s.endsWith(".tpl")) {
						s += ".js";
					}
					文件列表.add(new File(根路径, s));
				}
			}
		}
		return 文件列表;
	}
	private LinkedHashSet<File> 获取头注释导入文件(File 当前文件, String 注释) {
		LinkedHashSet<File> 文件列表 = new LinkedHashSet<File>();
		Pattern p = Pattern.compile("@import\\s+(.+)");
		Matcher m = p.matcher(注释);
		while(m.find()) {
			String s = m.group(1);
			File f = null;
			if(s.endsWith("*")) {
				s = s.substring(0, s.length() - 1);
				if(s.startsWith("/")) {
					f = new File(根路径, s);
				}
				else {
					f = new File(当前文件.getParent(), s);
				}
				File[] list = f.listFiles();
				for(File file : list) {
					if(file.getName().endsWith(".js") || file.getName().endsWith(".tpl")) {
						文件列表.add(file);
					}
				}
			}
			else {
				if(s.startsWith("/")) {
					f = new File(根路径, s);
				}
				else {
					f = new File(当前文件.getParent(), s);
				}
				文件列表.add(f);
			}
		}
		return 文件列表;
	}
	private String 提取文件内容(File f) {
		BufferedReader br = null;
		String s = null;
		StringBuilder sb = new StringBuilder();
		try {
			br = new BufferedReader(new FileReader(f));
			while((s = br.readLine()) != null) {
				sb.append(s);
				sb.append("\n");
			}
			br.close();
			return sb.toString();
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
		return "";
	}
	private String 提取头注释(String s) {
		if(s.startsWith("/*")) {
			int i = s.indexOf("*/");
			if(i == -1)
				return "";
			return s.substring(0, i + 2);
		}
		return "";
	}
	private boolean 是否模块(String s) {
		return Pattern.matches("^define\\s*\\([\\s\\S]+", s.trim());
	}
	private String 获取模块ID(String s) {
		if(是否模块(s)) {
			Pattern p = Pattern.compile("^\\s*define\\s*\\((['\"])(.+?)\\1");
			Matcher m = p.matcher(s);
			if(m.find()) {
				return m.group(2);
			}
			return null;
		}
		return null;
	}
	private boolean 是否模板(File f) {
		return f.getName().endsWith(".tpl");
	}

	private String 获取模块URI(File f) {
		String path = f.getAbsolutePath().substring(根路径.getAbsolutePath().length());
		path = path.replace('\\', '/')
				.replaceAll("\\w+/\\.\\./", "")
				.replace("./", "");
		if(path.endsWith(".js"))
			path = path.substring(0, path.length() - 3);
		if(path.endsWith("_src"))
			path = path.substring(0, path.length() - 4);
		else if(path.endsWith("_combo"))
			path = path.substring(0, path.length() - 6);
		return path;
	}
	private void 输出(StringBuilder 结果缓存) {
		BufferedWriter bw = null;
		try {
			bw = new BufferedWriter(new FileWriter(合并文件));
			bw.write(结果缓存.toString());
			bw.close();
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(1);
		} finally {
			if(bw != null) {
				try {
					bw.close();
				} catch(IOException e) {
					//
				}
			}
		}
		if(是否压缩) {
			String[] input = new String[4];
			input[0] = "--js=" + 合并文件.getAbsolutePath();
			input[1] = "--charset=gbk";
			input[2] = "--js_output_file=" + 压缩文件.getAbsolutePath();
			input[3] = "--warning_level=QUIET";

			CommandLineRunner runner = new CommandLineRunner(input);
			if (runner.shouldRunCompiler())
			{
				runner.run();
			}
		}
	}
	public static void 压缩(File 文件) {
		String 文件名 = 文件.getName();
		File 合并文件 = 文件;
		File 压缩文件 = null;
		if(文件名.endsWith("_src.js")) {
			合并文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 7) + ".js");
			if(合并文件.exists()) {
				压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 7) + ".min.js");
			}
			else {
				合并文件 = 文件;
				压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 7) + ".min.js");
			}
		}
		else {
			压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 3) + ".min.js");
		}
		System.out.println("---Compress:");
		System.out.println(压缩文件);
		String[] input = new String[4];
		input[0] = "--js=" + 合并文件.getAbsolutePath();
		input[1] = "--charset=gbk";
		input[2] = "--js_output_file=" + 压缩文件.getAbsolutePath();
		input[3] = "--warning_level=QUIET";

		CommandLineRunner runner = new CommandLineRunner(input);
		if (runner.shouldRunCompiler())
		{
			runner.run();
		}
	}
}
