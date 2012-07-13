package com.tudou.army;

import java.util.*;

public class JsBuilder {
	public static void main(String[] args) {
		HashMap<String, Boolean> global = new HashMap<String, Boolean>();
		for(int i = 2; i < args.length; i++) {
			global.put(args[i], true);
		}
		Builder builder = new Builder(args[0], args[1], global);
		builder.ÔËÐÐ();
	}
}
