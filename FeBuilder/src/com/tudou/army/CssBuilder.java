package com.tudou.army;

import java.io.*;
import java.util.*;
import java.util.regex.*;

import com.google.javascript.jscomp.CommandLineRunner;
import com.yahoo.platform.yui.compressor.YUICompressor;

public class CssBuilder {
	private File 根路径;
	private File 目标文件;
	private File 合并文件;
	private LinkedHashSet<File> 文件列表;
	private Boolean 是否压缩;
	private File 压缩文件;
	
	public CssBuilder(File 根路径, File 目标文件, Boolean 是否压缩) {
		this.根路径 = 根路径;
		this.目标文件 = 目标文件;
		this.是否压缩 = 是否压缩;
		是否压缩 = false;
		String name = 目标文件.getName();
		合并文件 = new File(目标文件.getParent(), name.substring(0, name.length() - 8) + ".css");
		压缩文件 = new File(目标文件.getParent(), name.substring(0, name.length() - 8) + ".min.css");
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
		递归导入文件(目标文件, 结果缓存);
		System.out.println("---Input:");
		for(File f : 文件列表) {
			System.out.println(f);
		}
		输出(结果缓存);
		System.out.println("---Output:");
		System.out.println(合并文件);
	}
	private void 递归导入文件(File 当前文件, StringBuilder 结果缓存) {
		if(文件列表.contains(当前文件)) {
			System.err.println("有重复导入的文件：" + 当前文件);
			return;
		}
		BufferedReader br = null;
		String s = null;
		try {
			br = new BufferedReader(new FileReader(当前文件));
			while((s = br.readLine()) != null) {
				Pattern p = Pattern.compile("\\s*@import\\s+url\\((.+)\\)\\s*;");
				Matcher m = p.matcher(s);
				//有@import外部css
				if(m.find()) {
					s = m.group(1);
					if(s.charAt(0) == '/') {
						递归导入文件(new File(根路径, s), 结果缓存);
					}
					else {
						递归导入文件(new File(当前文件.getParent(), s), 结果缓存);
					}
				}
				else {
					if(当前文件 != 目标文件) {
						//将导入文件的头信息的svn自动版本号替换掉
						if(s.startsWith(" * @")) {
							s = s.replaceAll(" \\$", " ");
						}
						//将相对引用图片地址分析更改
						else {
							Pattern p2 = Pattern.compile("url\\s*\\(\\s*([\"']?)(\\S+)\\1\\s*\\)");
							Matcher m2 = p2.matcher(s);
							while(m2.find()) {
								String s2 = m2.group(2);
								if(s2.startsWith("/") == false) {
									File f = new File(当前文件.getParent(), s2);
									s = s.replace(s2, "/community" + f.getAbsolutePath().replace(根路径.getAbsolutePath(), "").replace(File.separator, "/").replaceAll("\\w+/\\.\\./", "").replace("./", ""));
								}
							}
						}
					}
					结果缓存.append(s);
					结果缓存.append("\n");
				}
			}
			br.close();
			文件列表.add(当前文件);
		} catch (IOException e) {
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
			String[] args = new String[3]; 
			args[0] = 合并文件.getAbsolutePath();
			args[1] = "-o";
			args[2] = 压缩文件.getAbsolutePath();
			YUICompressor.parse(args);
		}
	}
	public static void 压缩(File 文件) {
		String 文件名 = 文件.getName();
		File 合并文件 = 文件;
		File 压缩文件 = null;
		if(文件名.endsWith("_src.css")) {
			合并文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 8) + ".css");
			if(合并文件.exists()) {
				压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 8) + ".min.css");
			}
			else {
				合并文件 = 文件;
				压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 8) + ".min.css");
			}
		}
		else {
			压缩文件 = new File(文件.getParent(), 文件名.substring(0, 文件名.length() - 3) + ".min.css");
		}
		System.out.println("---Compress:");
		System.out.println(压缩文件);
		String[] args = new String[3]; 
		args[0] = 合并文件.getAbsolutePath();
		args[1] = "-o";
		args[2] = 压缩文件.getAbsolutePath();
		YUICompressor.parse(args);
	}
}
