var chai = require('chai');
var expect = chai.expect;

var r = require("../lib/include");
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

	describe("prefixes extension should", function(){
	
		it("import modules", function(){
			newrequire.prefix("testData",__dirname+"/data/");
			expect(newrequire('testData:dataJS')).to.equal(require("./data/dataJS"));
		});

		it("always load modules relative to prefix", function(){
			newrequire.prefix("testData",__dirname+"/");
			expect(newrequire('testData:data/dataJS')).to.equal(require("./data/dataJS"));
			expect(newrequire('testData:./data/dataJS')).to.equal(require("./data/dataJS"));
			expect(newrequire('testData:/data/dataJS')).to.equal(require("./data/dataJS"));
		});

		it("import both js and json files", function(){
			newrequire.prefix("testData",__dirname+"/data/");
			expect(newrequire('testData:data')).to.equal(require("./data/data"));
			expect(newrequire('testData:dataJS')).to.equal(require("./data/dataJS"));
		});

		it("handle multiple levels od prefixes", function(){
			newrequire.prefix("root",__dirname+"/data/");
			newrequire.prefix("root:core",__dirname+"/data");
			expect(newrequire('root:data')).to.equal(require("./data/data"));
			expect(newrequire('root:core:data')).to.equal(require("./data/data"));
		});

		it("throw MODULE_NOT_FOUND when module is not found", function(){
			expect(function(){newrequire('root:net');}).to.throw(Error);
		});
	});
})

