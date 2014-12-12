var fs = require('fs');
var path = require('path');

function connect(ob,ob2, func){
	if(typeof ob2[func] == 'function'){
		ob[func] = function(){
			ob2[func].apply(ob2, arguments);
		}
	}else{
		ob.__defineGetter__(func, function(){
			return ob2[func];
		})
		ob.__defineSetter__(func, function(val){
			return ob2[func] = val;
		})
	}
}

function getCallerFile() {
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



function Include(){
	this.prefixes = {};
	this.self = this;
}

Include.prototype.prefix = function(name, path){
	this.prefixes[name] = path;
}

Include.prototype.require = function(name){
	try{
		return require(name);
	}catch(e){
		if(e.code == "MODULE_NOT_FOUND")
			e.message = "Connot find module '"+aname+"' in path '"+full+"'";
		throw e;
	}
}

Include.prototype.parsePrefix = function(name){
	var ret = {prefix: null, filename: name};
	var colon = name.lastIndexOf(":");
	if(colon != -1){
		ret.filename = name.slice(colon+1);
		ret.prefix = name.slice(0,colon);
	}
	return ret;
}

Include.prototype.call = function(name){
	var filepath = name;
	var data = this.parsePrefix(name);
	if(data.prefix){
		var pref = this.prefixes[data.prefix];
		data.basedir = pref;
	}else{
		if(data.filename[0]=="."){
			var caller = getCallerFile();
			caller = path.dirname(caller);
			data.basedir = caller;	
		}
	}
	if(data.basedir) filepath = path.join(data.basedir, data.filename) 

	return this.require(filepath);
}


function newrequire(){
	incl = new Include();
	function f(name){
		return incl.call(name);
	}
	connect(f, require, "main");
	connect(f, require, "cache");
	connect(f, require, "extensions");
	connect(f, require, "resolve");
	connect(f, require, "registerExtension");

	connect(f, incl,	"prefix");
	connect(f, incl, "self");
	return f;
}

newrequire.install = function(name){
	global[name] = newrequire();
}

module.exports = newrequire;

