{
    "source": {
    		"include": ["./"],
    		"exclude": ["doc", "sites", "node_modules"],
        "includePattern": ".+\\.js(doc)?$",
        "excludePattern": "(^|\\/|\\\\)_"
    },
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
    },
    "opts": {
				"template": "templates/default",  // same as -t templates/default
				"encoding": "utf8",               // same as -e utf8
				"destination": "./doc/",          // same as -d ./out/
				"recurse": true                  // same as -r
		}
}


