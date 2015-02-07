var chai = require('chai');
var expect = chai.expect;

var r = require("../lib/irequire");
r.install("newrequire");

describe("include - require decorator", function(){
	describe("base should", function(){
		it("import standard modules", function(){
			expect(require('net')).to.equal(newrequire('net'));
		});

		it("import files by relative path", function(){
			expect(require('./data/dataJS')).to.equal(newrequire('./data/dataJS'));
		});

		it("import files by absolute path", function(){
			expect(require(__dirname+'/data/dataJS')).to.equal(newrequire(__dirname+'/data/dataJS'));
		});

		it("should have structure like require",function(){
			expect(newrequire.main).to.equal(require.main);
			expect(newrequire.cache).to.equal(require.cache);
			expect(newrequire.extensions).to.equal(require.extensions);
		});

		it("throw MODULE_NOT_FOUND when module is not found", function(){
			expect(function(){newrequire('oko123');}).to.throw(Error);
		});
	});

	describe("prefixes extension", function(){
	
		it("should import modules", function(){
			newrequire.prefix("testData",__dirname+"/data/");
			expect(newrequire('testData:dataJS')).to.equal(require("./data/dataJS"));
		});

		it("can be functions", function(){
			newrequire.prefix("testData", function(q){
				if(q.key == "mod1")
					return __dirname+"/data/dataJS";
				else if(q.key == "mod2")
					return __dirname+"/data/data";
				else
					throw new Error("Unknown key");
			});
			expect(newrequire('testData:mod1')).to.equal(require("./data/dataJS"));
			expect(newrequire('testData:mod2')).to.equal(require("./data/data"));
			expect(function(){newrequire('testData:net');}).to.throw(Error);
		});

		it("should always load modules relative to prefix", function(){
			newrequire.prefix("testData",__dirname+"/");
			expect(newrequire('testData:data/dataJS')).to.equal(require("./data/dataJS"));
			expect(newrequire('testData:./data/dataJS')).to.equal(require("./data/dataJS"));
			expect(newrequire('testData:/data/dataJS')).to.equal(require("./data/dataJS"));
		});

		it("should import both js and json files", function(){
			newrequire.prefix("testData",__dirname+"/data/");
			expect(newrequire('testData:data')).to.equal(require("./data/data"));
			expect(newrequire('testData:dataJS')).to.equal(require("./data/dataJS"));
		});

		it("should handle multiple levels od prefixes", function(){
			newrequire.prefix("root",__dirname+"/data/");
			newrequire.prefix("root:core",__dirname+"/data");
			expect(newrequire('root:data')).to.equal(require("./data/data"));
			expect(newrequire('root:core:data')).to.equal(require("./data/data"));
		});

		it("should throw MODULE_NOT_FOUND when module is not found", function(){
			expect(function(){newrequire('root:net');}).to.throw(Error);
		});
	});

	describe("path extensions '*'", function(){
		it("should return empty list if no path found" ,function(){
			expect(newrequire('./oko/*'))
				.to.be.instanceOf(Array)
				.to.be.empty();
		})
		it("should return js file in list if *.js" ,function(){
			expect(newrequire('./data/*.js'))
				.to.be.instanceOf(Array)
				.to.include(require("./data/dataJS"));
		})
		it("should return js and json file when type not specyfied" ,function(){
			expect(newrequire('./data/*'))
				.to.be.instanceOf(Array)
				.to.include(require("./data/dataJS"))
				.to.include(require("./data/data"));
		})
		it("should find module if folder is unknown" ,function(){
			expect(newrequire('./*/data.json'))
				.to.be.instanceOf(Array)
				.to.be.length(1)
				.to.include(require("./data/data"));
		})
		it("should match only files" ,function(){
			expect(newrequire('./d*'))
				.to.be.instanceOf(Array)
				.to.be.empty();
		})
			
	});

	describe("additional info extension", function(){
		it("should return additional info", function(){
			expect(newrequire('./data/dataJS').__name).to.equal('dataJS');
		});
		it("should return nameOfFile - always", function(){
			newrequire.prefix("testData", function(q){
				return __dirname+"/data/dataJS";
			});
			expect(newrequire('testData:mod1').__name).to.equal("dataJS");
		});
	});
})

