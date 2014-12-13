var fs = require('fs');
var path = require('path');

function connect(ob,ob2, func){
	if(!func){
		for(var key in ob2){
			connect(ob, ob2, key);
		}
	}else if(typeof ob2[func] == 'function'){
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

function bind(ob, func){
	return function(){
		return ob[func].apply(ob, arguments);
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

Include.prototype.require = function(data){
	try{
		return require(data.requirePath);
	}catch(e){
		if(e.code == "MODULE_NOT_FOUND")
			e.message = "Connot find module '"+data.input+"' in path '"+data.filepath+"'";
		throw e;
	}
}

Include.prototype.parsePrefix = function(ret){
	var name = ret.input;
	var colon = name.lastIndexOf(":");
	if(colon != -1){
		ret.filename = ret.key = name.slice(colon+1);
		ret.prefix = name.slice(0,colon);
	}
	return ret;
}

Include.prototype.createData = function(name){
	return {
		input: name,
		prefix: null,
		key: name,
		filename: name,
		requirePath: null,
		callerDir: null,
		basedir: null,
	}
}
Include.prototype.isRelative = function(data){
	return data.filename[0]==".";
}
Include.prototype.getCallerAsBasePath = function(data){
	var caller = getCallerFile();
	caller = path.dirname(caller);
	data.basedir = caller;
}

Include.prototype.executePrefix = function(data){
	var pref = this.prefixes[data.prefix];
	if(typeof pref == "function")
		data.requirePath = pref(data);
	else
		data.basedir = pref;
}

Include.prototype.joinBaseWithFile = function(data){
	if(data.basedir)
		data.requirePath = path.join(data.basedir, data.filename) 
	else
		data.requirePath = data.filename;
}

Include.prototype.call = function(name){
	var data = this.createData(name);
	this.parsePrefix(data);
	if(data.prefix){
		this.executePrefix(data);
	}else{
		if(this.isRelative(data))
			this.getCallerAsBasePath(data);
		else{
			/*nothing*/
		}
	}
	if(!data.requirePath)
		this.joinBaseWithFile(data);
	return this.require(data);
}


function newrequire(){
	incl = new Include();
	var f = bind(incl, "call");

	connect(f, require);
	connect(f, incl,	"prefix");
	connect(f, incl,	"self");
	return f;
}

newrequire.install = function(name){
	global[name] = newrequire();
}

module.exports = newrequire;

