package com.tudou.army;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import com.google.javascript.jscomp.CustomCompiler;

public class Builder {
	public static String SVN头 = "\n * @url $URL$\n" +
			 " * @modified $Author$\n" +
			 " * @version $Rev$\n";
	public static String 默认头注释 = "/**" + SVN头 + " */";
	
	private String 根路径;
	private File 当前文件;
	private HashMap<String, Boolean> 全局模块;
	private HashMap<File, String> 文件注释;
	private HashMap<File, String> 文件内容;
	private HashMap<String, String> 模块ID;
	
	public Builder(String 根路径, String 当前文件路径, HashMap<String, Boolean> 全局模块) {
		if(!根路径.endsWith(File.separator))
			根路径 += File.separator;
		this.根路径 = 根路径;
		当前文件 = new File(当前文件路径);
		this.全局模块 = 全局模块;
		文件注释 = new HashMap<File, String>();
		文件内容 = new HashMap<File, String>();
		模块ID = new HashMap<String, String>();
	}
	
	public void 运行() {
		LinkedHashSet<File> 文件列表 = 取得文件导入列表(当前文件);
		文件列表.add(当前文件);
		输出(文件列表);
	}
	
	private LinkedHashSet<File> 取得文件导入列表(File 目标文件) {
		LinkedHashSet<File> 文件列表 = new LinkedHashSet<File>();
		递归遍历文件导入关系(目标文件, 文件列表);
		return 文件列表;
	}
	private void 递归遍历文件导入关系(File 目标文件, LinkedHashSet<File> 文件列表) {
		String 内容 = 读取文件内容(目标文件);
		String 注释开头 = 读取文件注释开头(内容);
		String 过滤注释的内容 = 内容.substring(注释开头.length()).trim();
		LinkedHashSet<File> 导入列表 = 获取注释导入文件列表(目标文件, 注释开头);
		LinkedHashSet<File> 构建列表 = 获取注释构建文件列表(目标文件, 过滤注释的内容);
		LinkedHashSet<File> 依赖列表 = 获取依赖文件列表(目标文件, 过滤注释的内容);
		文件注释.put(目标文件, 过滤注释开头(注释开头));
		文件内容.put(目标文件, 过滤注释的内容);
		String ID = 获取模块ID(过滤注释的内容);
		模块ID.put(目标文件.getAbsolutePath(), ID);
		//允许导入全局模块，但依赖的全局模块会被忽略
		if(ID != null && 全局模块.containsKey(ID) && 目标文件 != 当前文件) {
			return;
		}
		String URI = 获取模块URI(目标文件);
		if(全局模块.containsKey(URI) && 目标文件 != 当前文件) {
			return;
		}
		导入列表.addAll(构建列表);
		导入列表.addAll(依赖列表);
		for(File file : 导入列表) {
			递归遍历文件导入关系(file, 文件列表);
			//允许导入全局模块，但依赖的全局模块会被忽略
			/*String s = file.getAbsolutePath();
			s = 模块ID.get(s);
			if(s != null && 全局模块.containsKey(s))
				continue;*/
			文件列表.add(file);
		}
	}
	private String 读取文件内容(File 目标文件) {
		BufferedReader br = null;
		StringBuilder sb = new StringBuilder();
		String s = null;
		try {
			br = new BufferedReader(new FileReader(目标文件));
			while((s = br.readLine()) != null) {
				sb.append(s);
				sb.append("\n");
			}
			br.close();
		} catch(IOException e) {
			e.printStackTrace();
		} finally {
			if(br != null) {
				try {
					br.close();
				} catch(IOException e) {
					//
				}
			}
		}
		return sb.toString();
	}
	private String 读取文件注释开头(String s) {
		if(s.startsWith("/*")) {
			int i = s.indexOf("*/");
			if(i == -1)
				return "";
			return s.substring(0, i + 2);
		}
		return "";
	}
	private LinkedHashSet<File> 获取注释导入文件列表(File 目标文件, String 注释) {
		LinkedHashSet<File> 文件列表 = new LinkedHashSet<File>();
		Pattern p = Pattern.compile("\\@import\\s+(.+?\\.js)");
		Matcher m = p.matcher(注释);
		while(m.find()) {
			String s = m.group(1);
			File f = null;
			//全部是相对根路径
			/*if(s.startsWith("/"))
				f = new File(根路径 + s);
			else
				f = new File(目标文件.getParent() + File.separator + s);*/
			if(s.startsWith("/"))
				s = s.substring(1);
			f = new File(根路径 + s);
			文件列表.add(f);
		}
		return 文件列表;
	}
	private String 过滤注释开头(String 注释) {
		return 注释.replaceAll("\n\\s*\\*\\s*\\@import[^\n]+", "")
				.replaceAll("\n\\s*\\*\\s*\\@![^\n]+", "");
	}
	private void 输出(LinkedHashSet<File> 文件列表) {
		StringBuilder sb = new StringBuilder();
		System.out.println("---input:");
		String s = null;
		int i = 0;
		for(File f : 文件列表) {
			System.out.println(f.getAbsolutePath());
			if(i++ == 0) {
				写入头注释();
				sb.append(文件注释.get(当前文件));
				sb.append("\n");
			}
			if(i == 文件列表.size())
				sb.append(文件注释.get(f));
			else
				sb.append(过滤svn(文件注释.get(f)));
			sb.append("\n");
			String result = 文件内容.get(f);
			if(是否模块(result)) {
				sb.append("define.url('");
				String path = 获取模块URI(f);
				sb.append(path);
				sb.append("');\n");
			}
			sb.append(result);
			sb.append("\n");
		}
		String output = 当前文件.getName();
		String compress = output;
		if(output.endsWith("_src.js")) {
			compress = output.substring(0, output.length() - 7) + ".js";
			output = output.substring(0, output.length() - 7) + "_combo.js";
		}
		else {
			System.out.println("---overwriter:");
			System.out.println(当前文件.getAbsolutePath());
			return;
		}
		compress = 当前文件.getParent() + File.separatorChar + compress;
		output = 当前文件.getParent() + File.separatorChar + output;
		System.out.println("---output:");
		s = sb.toString().trim();
		BufferedWriter bw = null;
		try {
			bw = new BufferedWriter(new FileWriter(output));
			bw.write(s);
			bw.close();
		} catch(IOException e) {
			e.printStackTrace();
		} finally {
			if(bw != null) {
				try {
					bw.close();
				} catch(IOException e) {
					//
				}
			}
		}
		System.out.println(output);
		System.out.println("---compress:");
		System.out.println(compress);
		s = CustomCompiler.compiler(output);
		try {
			bw = new BufferedWriter(new FileWriter(compress));
			bw.write(文件注释.get(当前文件));
			bw.write("\n");
			bw.write(s);
			bw.close();
		} catch(IOException e) {
			e.printStackTrace();
		} finally {
			if(bw != null) {
				try {
					bw.close();
				} catch(IOException e) {
					//
				}
			}
		}
	}
	private LinkedHashSet<File> 获取依赖文件列表(File 目标文件, String 代码) {
		LinkedHashSet<File> 列表 = new LinkedHashSet<File>();
		String s = null;
		File f = null;
		if(!是否模块(代码))
			return 列表;
		//显示声明的依赖
		Pattern p = Pattern.compile("\\bdefine\\s*\\(.*?\\[(.*?)\\]");
		Matcher m = p.matcher(代码);
		if(m.find()) {
			s = m.group(1);
			p = Pattern.compile("(['\"])(.+?)\\1");
			m = p.matcher(s);
			while(m.find()) {
				s = m.group(2);
				f = 获取依赖文件(目标文件, s);
				if(f != null)
					列表.add(f);
			}
		}
		//隐式require的依赖require("module")
		p = Pattern.compile("(?:^|[^.])\\s*\\brequire\\s*\\(\\s*([\"'])([^\"'\\s\\)]+)\\1\\s*\\)\\s*[^,]");
		m = p.matcher(代码);
		while(m.find()) {
			s = m.group(2);
			f = 获取依赖文件(目标文件, s);
			if(f != null)
				列表.add(f);
		}
		return 列表;
	}
	private File 获取依赖文件(File 目标文件, String s) {
		File f = null;
		if(!s.endsWith(".js"))
			s += ".js";
		int i = s.indexOf('/');
		if(i == -1)
			i = 0;
		if(!全局模块.containsKey(s.substring(i, s.length() - 3))) {
			if(s.startsWith("/"))
				s = 根路径 + s.substring(1);
			else
				s = 目标文件.getParent() + File.separator + s;
			f = new File(s);
			if(!f.exists()) {
				System.err.println(f.getAbsolutePath() + "不存在");
				System.exit(0);
			}
		}
		return f;
	}
	private LinkedHashSet<File> 获取注释构建文件列表(File 目标文件, String 代码) {
		LinkedHashSet<File> 列表 = new LinkedHashSet<File>();
		Pattern p = Pattern.compile("\n\\s*//\\@import\n\\s*require\\s*\\(([^\\]{();]+)");
		Matcher m = p.matcher(代码);
		while(m.find()) {
			String s = m.group(1);
			Pattern p2 = Pattern.compile("([\"'])([^\"'\\s\\)]+)\\1");
			Matcher m2 = p2.matcher(s);
			while(m2.find()) {
				File f = 获取依赖文件(目标文件, m2.group(2));
				if(f != null)
					列表.add(f);
			}
		}
		return 列表;
	}
	private String 过滤svn(String s) {
		return s.replaceAll("\\$?(Id|Rev|LastChangedDate|Author|Date|URL)\\:?\\s*", "");
	}
	private String 获取模块ID(String s) {
		if(是否模块(s)) {
			Pattern p = Pattern.compile("\\bdefine\\s*\\((['\"])(.+?)\\1");
			Matcher m = p.matcher(s);
			if(m.find()) {
				return m.group(2);
			}
			return null;
		}
		return null;
	}
	private String 获取模块URI(File f) {
		String path = f.getAbsolutePath().substring(根路径.length() - 1);
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
	private void 写入头注释() {
		String s = 文件注释.get(当前文件);
		if(s.length() == 0) {
			s = 默认头注释;
		}
		else if(s.indexOf("@version") == -1) {
			s = s.replace("/**", "/**" + SVN头);
		}
		else
			return;
		文件注释.put(当前文件, s);
		//写回当前文件
		BufferedWriter bw = null;
		try {
			bw = new BufferedWriter(new FileWriter(当前文件));
			bw.write(s);
			bw.write("\n");
			bw.write(文件内容.get(当前文件));
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
	
	public static boolean 是否模块(String 代码) {
		return 代码.startsWith("define(");
	}
}
