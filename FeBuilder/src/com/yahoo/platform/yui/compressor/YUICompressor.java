/*
 * YUI Compressor
 * http://developer.yahoo.com/yui/compressor/
 * Author: Julien Lecomte -  http://www.julienlecomte.net/
 * Copyright (c) 2011 Yahoo! Inc.  All rights reserved.
 * The copyrights embodied in the content of this file are licensed
 * by Yahoo! Inc. under the BSD (revised) open source license.
 */
package com.yahoo.platform.yui.compressor;

import jargs.gnu.CmdLineParser;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.Charset;

import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

public class YUICompressor {

	public static void main(String[] args) {
		String[] input = new String[3];
		input[0] = "D:\\script\\1.css";
		input[1] = "-o";
		input[2] = "D:\\scriptout\\1.css";

		YUICompressor.parse(input);
	}

	/**
	 * 
	 * @param args
	 * @return 0:成功,-1:line-break参数错误(暂时用不到此参数),-2:文件类型错误,-3:IO异常,-4:输入数据错误
	 */
	@SuppressWarnings({ "unchecked", "unused", "rawtypes" })
	public static int parse(String args[]) {

		CmdLineParser parser = new CmdLineParser();
		CmdLineParser.Option typeOpt = parser.addStringOption("type");
		CmdLineParser.Option verboseOpt = parser.addBooleanOption('v', "verbose");
		CmdLineParser.Option nomungeOpt = parser.addBooleanOption("nomunge");
		CmdLineParser.Option linebreakOpt = parser.addStringOption("line-break");
		CmdLineParser.Option preserveSemiOpt = parser.addBooleanOption("preserve-semi");
		CmdLineParser.Option disableOptimizationsOpt = parser.addBooleanOption("disable-optimizations");
		CmdLineParser.Option helpOpt = parser.addBooleanOption('h', "help");
		CmdLineParser.Option charsetOpt = parser.addStringOption("charset");
		CmdLineParser.Option outputFilenameOpt = parser.addStringOption('o', "output");

		Reader in = null;
		Writer out = null;

		try {

			parser.parse(args);

			// 关闭帮助接口
			// Boolean help = (Boolean) parser.getOptionValue(helpOpt);
			// if (help != null && help.booleanValue()) {
			// usage();
			// }

			boolean verbose = parser.getOptionValue(verboseOpt) != null;

			String charset = (String) parser.getOptionValue(charsetOpt);
			if (charset == null || !Charset.isSupported(charset)) {
				// charset = System.getProperty("file.encoding");
				// if (charset == null) {
				// charset = "UTF-8";
				// }

				// UTF-8 seems to be a better choice than what the system is
				// reporting
				charset = "UTF-8";

				if (verbose) {
					System.err.println("\n[INFO] Using charset " + charset);
				}
			}

			int linebreakpos = -1;
			String linebreakstr = (String) parser.getOptionValue(linebreakOpt);
			if (linebreakstr != null) {
				try {
					linebreakpos = Integer.parseInt(linebreakstr, 10);
				} catch (NumberFormatException e) {
					e.printStackTrace();
					return -1;
				}
			}

			String type = (String) parser.getOptionValue(typeOpt);
			if (type != null && !type.equalsIgnoreCase("js") && !type.equalsIgnoreCase("css")) {
				// 类型不正确
				return -2;
			}

			String[] fileArgs = parser.getRemainingArgs();
			java.util.List files = java.util.Arrays.asList(fileArgs);
			if (files.isEmpty()) {
				if (type == null) {
					// 类型错误
					return -2;
				}
				files = new java.util.ArrayList();
				files.add("-"); // read from stdin
			}

			String output = (String) parser.getOptionValue(outputFilenameOpt);
			String pattern[] = output != null ? output.split(":") : new String[0];

			java.util.Iterator filenames = files.iterator();
			while (filenames.hasNext()) {
				String inputFilename = (String) filenames.next();

				try {
					if (inputFilename.equals("-")) {

						in = new InputStreamReader(System.in, charset);

					} else {

						if (type == null) {
							int idx = inputFilename.lastIndexOf('.');
							if (idx >= 0 && idx < inputFilename.length() - 1) {
								type = inputFilename.substring(idx + 1);
							}
						}

						if (type == null || !type.equalsIgnoreCase("js") && !type.equalsIgnoreCase("css")) {
							// 类型错误
							return -2;
						}

						in = new InputStreamReader(new FileInputStream(inputFilename), charset);
					}

					String outputFilename = output;
					// if a substitution pattern was passed in
					if (pattern.length > 1 && files.size() > 1) {
						outputFilename = inputFilename.replaceFirst(pattern[0], pattern[1]);
					}

					if (type.equalsIgnoreCase("js")) {
						// 解析js的代码,可以略过.js使用google的压缩工具进行压缩
						try {

							JavaScriptCompressor compressor = new JavaScriptCompressor(in, new ErrorReporter() {

								public void warning(String message, String sourceName, int line, String lineSource,
										int lineOffset) {
									if (line < 0) {
										System.err.println("\n[WARNING] " + message);
									} else {
										System.err.println("\n[WARNING] " + line + ':' + lineOffset + ':' + message);
									}
								}

								public void error(String message, String sourceName, int line, String lineSource,
										int lineOffset) {
									if (line < 0) {
										System.err.println("\n[ERROR] " + message);
									} else {
										System.err.println("\n[ERROR] " + line + ':' + lineOffset + ':' + message);
									}
								}

								public EvaluatorException runtimeError(String message, String sourceName, int line,
										String lineSource, int lineOffset) {
									error(message, sourceName, line, lineSource, lineOffset);
									return new EvaluatorException(message);
								}
							});

							// Close the input stream first, and then open the
							// output stream,
							// in case the output file should override the input
							// file.
							in.close();
							in = null;

							if (outputFilename == null) {
								out = new OutputStreamWriter(System.out, charset);
							} else {
								out = new OutputStreamWriter(new FileOutputStream(outputFilename), charset);
							}

							boolean munge = parser.getOptionValue(nomungeOpt) == null;
							boolean preserveAllSemiColons = parser.getOptionValue(preserveSemiOpt) != null;
							boolean disableOptimizations = parser.getOptionValue(disableOptimizationsOpt) != null;

							compressor.compress(out, linebreakpos, munge, verbose, preserveAllSemiColons,
									disableOptimizations);

						} catch (EvaluatorException e) {

							e.printStackTrace();
							// Return a special error code used specifically by
							// the web front-end.
						}

					} else if (type.equalsIgnoreCase("css")) {
						// css压缩
						CssCompressor compressor = new CssCompressor(in);

						// Close the input stream first, and then open the
						// output stream,
						// in case the output file should override the input
						// file.
						in.close();
						in = null;

						if (outputFilename == null) {
							out = new OutputStreamWriter(System.out, charset);
						} else {
							out = new OutputStreamWriter(new FileOutputStream(outputFilename), charset);
						}

						compressor.compress(out, linebreakpos);
					}

				} catch (IOException e) {
					e.printStackTrace();
					// IO异常
					return -3;
				} finally {

					if (in != null) {
						try {
							in.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}

					if (out != null) {
						try {
							out.close();
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			}
		} catch (CmdLineParser.OptionException e) {
			e.printStackTrace();
			usage();
			// 输入错误
			return -4;
		}

		return 0;
	}

	private static void usage() {
		System.err.println("\nUsage: java -jar yuicompressor-x.y.z.jar [options] [input file]\n\n"

		+ "Global Options\n" + "  -h, --help                Displays this information\n"
				+ "  --type <js|css>           Specifies the type of the input file\n"
				+ "  --charset <charset>       Read the input file using <charset>\n"
				+ "  --line-break <column>     Insert a line break after the specified column number\n"
				+ "  -v, --verbose             Display informational messages and warnings\n"
				+ "  -o <file>                 Place the output into <file>. Defaults to stdout.\n"
				+ "                            Multiple files can be processed using the following syntax:\n"
				+ "                            java -jar yuicompressor.jar -o '.css$:-min.css' *.css\n"
				+ "                            java -jar yuicompressor.jar -o '.js$:-min.js' *.js\n\n"

				+ "JavaScript Options\n" + "  --nomunge                 Minify only, do not obfuscate\n"
				+ "  --preserve-semi           Preserve all semicolons\n"
				+ "  --disable-optimizations   Disable all micro optimizations\n\n"

				+ "If no input file is specified, it defaults to stdin. In this case, the 'type'\n"
				+ "option is required. Otherwise, the 'type' option is required only if the input\n"
				+ "file extension is neither 'js' nor 'css'.");
	}
}
