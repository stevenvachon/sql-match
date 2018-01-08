"use strict";
const {after, before, beforeEach, describe, it} = require("mocha");
const {expect} = require("chai");
const isSQLMatch = require("./");
const Nightmare = require("nightmare");



describe("Node.js", function()
{
	const sentence = "1234567890!@#$^&*()-+=[]{},./? aaaabbbb sentence-like string";
	const string = "string";



	it("supports no wildcards", function()
	{
		expect( isSQLMatch("string", string) ).to.be.true;
		expect( isSQLMatch("STRING", string) ).to.be.false;
		expect( isSQLMatch("strung", string) ).to.be.false;
		expect( isSQLMatch("strin",  string) ).to.be.false;
		expect( isSQLMatch("strings",string) ).to.be.false;
		expect( isSQLMatch("stringg",string) ).to.be.false;
		expect( isSQLMatch("sstring",string) ).to.be.false;
		expect( isSQLMatch("a",      string) ).to.be.false;
		expect( isSQLMatch("",       string) ).to.be.false;

		expect( isSQLMatch("","") ).to.be.true;

		expect( isSQLMatch(String.raw`\s\t\r\i\n\g`,string) ).to.be.true;
		expect( isSQLMatch("\\s\\t\\r\\i\\n\\g",    string) ).to.be.true;
		expect( isSQLMatch("\\s\\t\\r\\i\\n\\g\\s", string) ).to.be.false;

		expect( isSQLMatch("st\\ring",   "st\\ring") ).to.be.false;
		expect( isSQLMatch("st\\rings",  "st\\ring") ).to.be.false;
		expect( isSQLMatch("st\\\\ring", "st\\ring") ).to.be.true;

		expect( isSQLMatch(String.raw`\\string`, String.raw`\string`) ).to.be.true;

		expect( isSQLMatch(sentence, sentence) ).to.be.true;
	});



	it(`supports "_" wildcard`, function()
	{
		expect( isSQLMatch("_",       string) ).to.be.false;
		expect( isSQLMatch("_tring",  string) ).to.be.true;
		expect( isSQLMatch("strin_",  string) ).to.be.true;
		expect( isSQLMatch("str_ng",  string) ).to.be.true;
		expect( isSQLMatch("st__ng",  string) ).to.be.true;
		expect( isSQLMatch("_t__n_",  string) ).to.be.true;
		expect( isSQLMatch("______",  string) ).to.be.true;
		expect( isSQLMatch("_string", string) ).to.be.false;
		expect( isSQLMatch("_string_",string) ).to.be.false;
		expect( isSQLMatch("________",string) ).to.be.false;
		expect( isSQLMatch("_\\tring",string) ).to.be.true;
		expect( isSQLMatch("strin\\_",string) ).to.be.false;

		expect( isSQLMatch("_string", "sstring") ).to.be.true;
		expect( isSQLMatch("_string","ssstring") ).to.be.false;

		expect( isSQLMatch("\\_tring",  "_tring") ).to.be.true;
		expect( isSQLMatch("str\\_ng",  "str_ng") ).to.be.true;
		expect( isSQLMatch("st\\_\\_ng","st__ng") ).to.be.true;
		expect( isSQLMatch("strin\\_",  "strin_") ).to.be.true;

		expect( isSQLMatch(String.raw`string\_`, "string_") ).to.be.true;

		expect( isSQLMatch("________________________________________sentence______string", sentence) ).to.be.true;
	});



	it(`supports "%" wildcard`, function()
	{
		expect( isSQLMatch("%",       string) ).to.be.true;
		expect( isSQLMatch("%tring",  string) ).to.be.true;
		expect( isSQLMatch("strin%",  string) ).to.be.true;
		expect( isSQLMatch("str%ng",  string) ).to.be.true;
		expect( isSQLMatch("st%%ng",  string) ).to.be.true;
		expect( isSQLMatch("%t%%n%",  string) ).to.be.true;
		expect( isSQLMatch("%%%%%%",  string) ).to.be.true;
		expect( isSQLMatch("%string", string) ).to.be.true;
		expect( isSQLMatch("%string%",string) ).to.be.true;
		expect( isSQLMatch("%%%%%%%%",string) ).to.be.true;
		expect( isSQLMatch("%\\tring",string) ).to.be.true;
		expect( isSQLMatch("strin\\%",string) ).to.be.false;

		expect( isSQLMatch("%string", "sstring") ).to.be.true;
		expect( isSQLMatch("%string","ssstring") ).to.be.true;

		expect( isSQLMatch("\\%tring",  "%tring") ).to.be.true;
		expect( isSQLMatch("str\\%ng",  "str%ng") ).to.be.true;
		expect( isSQLMatch("st\\%\\%ng","st%%ng") ).to.be.true;
		expect( isSQLMatch("strin\\%",  "strin%") ).to.be.true;

		expect( isSQLMatch(String.raw`string\%`, "string%") ).to.be.true;

		expect( isSQLMatch("%sentence%string", sentence) ).to.be.true;
	});



	it(`supports a mix of "_" and "%" wildcards`, function()
	{
		expect( isSQLMatch("%_",     string) ).to.be.true;
		expect( isSQLMatch("%__",    string) ).to.be.true;
		expect( isSQLMatch("%___",   string) ).to.be.true;
		expect( isSQLMatch("%____",  string) ).to.be.true;
		expect( isSQLMatch("%_____", string) ).to.be.true;
		expect( isSQLMatch("%____%", string) ).to.be.true;
		expect( isSQLMatch("%_%%_%", string) ).to.be.true;
		expect( isSQLMatch("%_____%",string) ).to.be.true;
		expect( isSQLMatch("%______",string) ).to.be.true;

		expect( isSQLMatch("_%",     string) ).to.be.true;
		expect( isSQLMatch("_%%",    string) ).to.be.true;
		expect( isSQLMatch("_%%%",   string) ).to.be.true;
		expect( isSQLMatch("_%%%%",  string) ).to.be.true;
		expect( isSQLMatch("_%%%%%", string) ).to.be.true;
		expect( isSQLMatch("_%%%%_", string) ).to.be.true;
		expect( isSQLMatch("_%__%_", string) ).to.be.true;
		expect( isSQLMatch("_%%%%%_",string) ).to.be.true;
		expect( isSQLMatch("_%%%%%%",string) ).to.be.true;

		expect( isSQLMatch("s%_g",    string) ).to.be.true;
		expect( isSQLMatch("s%__g",   string) ).to.be.true;
		expect( isSQLMatch("s%___g",  string) ).to.be.true;
		expect( isSQLMatch("s%__%g",  string) ).to.be.true;
		expect( isSQLMatch("s%_%_g",  string) ).to.be.true;
		expect( isSQLMatch("s%___%g", string) ).to.be.true;
		expect( isSQLMatch("s%___%g_",string) ).to.be.false;

		expect( isSQLMatch("s_%g",    string) ).to.be.true;
		expect( isSQLMatch("s_%%g",   string) ).to.be.true;
		expect( isSQLMatch("s_%%%g",  string) ).to.be.true;
		expect( isSQLMatch("s_%%_g",  string) ).to.be.true;
		expect( isSQLMatch("s_%_%g",  string) ).to.be.true;
		expect( isSQLMatch("s_%%%_g", string) ).to.be.true;
		expect( isSQLMatch("s_%%%_g%",string) ).to.be.true;

		expect( isSQLMatch("s_%z", string) ).to.be.false;
		expect( isSQLMatch("s%_z", string) ).to.be.false;
		expect( isSQLMatch("s_z%g",string) ).to.be.false;
		expect( isSQLMatch("s%z_g",string) ).to.be.false;

		expect( isSQLMatch("\\%\\_ring","%_ring") ).to.be.true;
		expect( isSQLMatch("\\_\\%ring","_%ring") ).to.be.true;
		expect( isSQLMatch("st\\%\\_ng","st%_ng") ).to.be.true;
		expect( isSQLMatch("st\\_\\%ng","st_%ng") ).to.be.true;
		expect( isSQLMatch("stri\\%\\_","stri%_") ).to.be.true;
		expect( isSQLMatch("stri\\_\\%","stri_%") ).to.be.true;
		expect( isSQLMatch("\\%trin\\_","%trin_") ).to.be.true;
		expect( isSQLMatch("\\_trin\\%","_trin%") ).to.be.true;

		expect( isSQLMatch(String.raw`\_trin\%`,"_trin%") ).to.be.true;

		expect( isSQLMatch("%s_nt_nc_%str_ng", sentence) ).to.be.true;
	});



	it("rejects non-string input", function()
	{
		const args = ["", 1, true, {}, [], function(){}];

		args.forEach((argA, a) =>
		{
			args.forEach((argB, b) =>
			{
				if (a!==b || a!==0)
				{
					expect(() => isSQLMatch(argA, argB)).to.throw();
				}
			});
		});
	});
});



describe("Web browser", function()
{
	let browser;

	before(() => browser = new Nightmare({ nodeIntegration:false }).goto("about:blank"));

	beforeEach(() => browser.refresh().then(() => browser.inject("js", "./browser.js")));

	after(() => browser.end());



	it("works", function()
	{
		return browser.evaluate( function()
		{
			return window.isSQLMatch("%ing", "string");
		})
		.then(result => expect(result).to.be.true);
	});
});
