IRequire
=========

Node.JS require extension. It will add some aditional functionality to standard require function.

IRequire is fully compatible with require. 

## Instalation
```bash
npm install --save irequire
```


## Usage
**in main file - app.js for example**
```js
var path = require('path');
irequire = require('irequire')()

var net = irequire("net"); // irequire is fully compatible with require

// you can define prefixes to remember some key paths
irequire.prefix("controllers",path.join(__dirname,"app/controllers/"));
irequire.prefix("config",path.join(__dirname,"config"));


var someconfig = irequire("config:some") // equiwalent to require(__dirname+"/config/some");
var home = irequire("controllers:home") // equiwalent to require(__dirname+"/app/controllers/home");

//as prefix you can use function
irequire.prefix("ext",function(query){
	if(query.key == "mod1")
		return __dirname+"/module1.js";
	else
		throw new Error("Unknown key");
});

var mod = irequire("ext:mod1") // will return ./module1.js
var mod2 = irequire("ext:anyelse") // will throw error
```

Have fun :)

## License

MIT License Copyright © 2014 Mateusz Russak

