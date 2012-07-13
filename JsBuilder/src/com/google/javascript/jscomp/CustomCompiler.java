package com.google.javascript.jscomp;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintStream;

public class CustomCompiler {
	public static void compiler(String input, String output) {
		String[] in = new String[1];
		in[0] = input;
		compiler(in, output);
	}
	public static void compiler(String[] input, String output) {
		String[] args = new String[input.length + 1];
		System.arraycopy(input, 0, args, 0, input.length);
		args[args.length - 1] = "--js_output_file=" + output;
		for(int i = 0; i < args.length - 1; i++) {
			args[i] = "--js=" + args[i];
		}
		
		CommandLineRunner clr = new CommandLineRunner(args);
		clr.run();
	}
	public static String compiler(String input) {
		String[] in = new String[1];
		in[0] = input;
		return compiler(in);
	}
	public static void main(String[] args) throws Exception{
		ByteArrayOutputStream b = new ByteArrayOutputStream();
		PrintStream s  = new PrintStream(b);
		
		BufferedWriter bb = new BufferedWriter(
		          new OutputStreamWriter(s));
		
		bb.write("test");
		
		bb.flush();
		
	}
	public static String compiler(String[] input) {
		String[] args = new String[input.length + 1];
		System.arraycopy(input, 0, args, 0, input.length);
		for(int i = 0; i < args.length - 1; i++) {
			args[i] = "--js=" + args[i];
		}
		args[args.length - 1] = "--charset=gbk";
		
		CommandLineRunner clr = new CommandLineRunner(args);
		return clr.runWithReturn();
	}
}
