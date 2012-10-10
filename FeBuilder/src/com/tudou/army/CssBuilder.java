package com.tudou.army;

import java.io.*;
import java.util.*;
import java.util.regex.*;

public class CssBuilder {
	private File ��·��;
	private File Ŀ���ļ�;
	private File �ϲ��ļ�;
	private LinkedHashSet<File> �ļ��б�;
	
	public CssBuilder(File ��·��, File Ŀ���ļ�) {
		this.��·�� = ��·��;
		this.Ŀ���ļ� = Ŀ���ļ�;
		String name = Ŀ���ļ�.getName();
		�ϲ��ļ� = new File(Ŀ���ļ�.getParent(), name.substring(0, name.length() - 8) + ".css");
		if(!�ϲ��ļ�.exists()) {
			try {
				�ϲ��ļ�.createNewFile();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		�ļ��б� = new LinkedHashSet<File>();
	}
	public void ����() {
		StringBuilder ������� = new StringBuilder();
		�ݹ鵼���ļ�(Ŀ���ļ�, �������);
		System.out.println("---Input:");
		for(File f : �ļ��б�) {
			System.out.println(f);
		}
		���(�������);
		System.out.println("---Output:");
		System.out.println(�ϲ��ļ�);
	}
	private void �ݹ鵼���ļ�(File ��ǰ�ļ�, StringBuilder �������) {
		if(�ļ��б�.contains(��ǰ�ļ�)) {
			System.err.println("���ظ�������ļ���" + ��ǰ�ļ�);
			return;
		}
		BufferedReader br = null;
		String s = null;
		ArrayList<File> al = new ArrayList<File>();
		try {
			br = new BufferedReader(new FileReader(��ǰ�ļ�));
			while((s = br.readLine()) != null) {
				Pattern p = Pattern.compile("\\s*@import\\s+url\\((.+)\\)\\s*;");
				Matcher m = p.matcher(s);
				//��@import�ⲿcss
				if(m.find()) {
					s = m.group(1);
					if(s.charAt(0) == '/') {
						al.add(new File(��·��, s));
					}
					else {
						al.add(new File(��ǰ�ļ�.getParent(), s));
					}
				}
				else {
					if(��ǰ�ļ� != Ŀ���ļ�) {
						//�������ļ���ͷ��Ϣ��svn�Զ��汾���滻��
						if(s.startsWith(" * @")) {
							s = s.replaceAll(" \\$", " ");
						}
						//���������ͼƬ��ַ��������
						else {
							Pattern p2 = Pattern.compile("url\\s*\\(\\s*([\"']?)(\\S+)\\1\\s*\\)");
							Matcher m2 = p2.matcher(s);
							while(m2.find()) {
								String s2 = m2.group(2);
								if(s2.startsWith("/") == false) {
									File f = new File(��ǰ�ļ�.getParent(), s2);
									s = s.replace(s2, "/community" + f.getAbsolutePath().replace(��·��.getAbsolutePath(), "").replace(File.separator, "/").replaceAll("\\w+/\\.\\./", "").replace("./", ""));
								}
							}
						}
					}
					�������.append(s);
					�������.append("\n");
				}
			}
			br.close();
			�ļ��б�.add(��ǰ�ļ�);
			//import�����ļ�������ɺ�ſ�ʼ����
			for(File f: al) {
				�ݹ鵼���ļ�(f, �������);
			}
		} catch (IOException e) {
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
	}
	private void ���(StringBuilder �������) {
		BufferedWriter bw = null;
		try {
			bw = new BufferedWriter(new FileWriter(�ϲ��ļ�));
			bw.write(�������.toString());
			bw.close();
		} catch (IOException e) {
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
}