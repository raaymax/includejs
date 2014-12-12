var fs = require('fs');
var path = require('path');

function connect(ob,ob2, func){
	ob.__defineGetter__(func, function(){
		return ob2[func];
	})
	ob.__defineSetter__(func, function(val){
		return ob2[func] = val;
	})
}

function _getCallerFile() {
    try {
        var err = new Error();
        var callerfile;
        var currentfile;

		var back = Error.prepareStackTrace;
        Error.prepareStackTrace = function (err, stack) { return stack; };
        currentfile = err.stack.shift().getFileName();
		Error.prepareStackTrace = back;
		
        while (err.stack.length) {
			callerfile = err.stack.shift().getFileName();
            if(currentfile !== callerfile) return callerfile;
        }
	} catch (err) {}
	return undefined;
}

var newrequire = function(aname){
	var full = aname;
	var name;
	var pref;
	var p = "";
	var colon = aname.lastIndexOf(":");
	if(aname[0] == "."){
		var caller = _getCallerFile();
		caller = caller.slice(0,caller.lastIndexOf("/")+1);
		full = caller+aname;	
	}
	//newrequire.prefixExtension(full,aname);
	if(colon != -1){
		name = aname.slice(colon+1);
		pref = aname.slice(0,colon);
		p = newrequire.prefixes[pref];
		full = path.join(p, name);
	}
	try{
		return require(full);
	}catch(e){
		if(e.code == "MODULE_NOT_FOUND")
			e.message = "Connot find module '"+aname+"' in path '"+full+"'";
		throw e;
	}
}

newrequire.oldrequire = require;

newrequire.install = function(name){
	global[name] = newrequire;	
}

connect(newrequire, require, "main");
connect(newrequire, require, "cache");
connect(newrequire, require, "extensions");

newrequire.resolve = function(){return require.resolve.apply(require, arguments);}
newrequire.registerExtension = function(){return require.registerExtension.apply(require, arguments);}


newrequire.prefixes = {}
newrequire.prefix =  function(prefix, path){
	newrequire.prefixes[prefix] = path;
}

module.exports = newrequire;

