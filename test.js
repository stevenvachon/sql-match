"use strict";
const {describe, it} = require("mocha");
const {expect} = require("chai");
const {isSQLMatch, sqlToRegex} = require("./");



describe("isSQLMatch", () =>
{
	const sentence = "1234567890!@#$^&*()-+=[]{},./? aaaabbbb sentence-like string";
	const string = "string";



	it("supports no wildcards", () =>
	{
		expect( isSQLMatch("string", string) ).to.be.true;
		expect( isSQLMatch("STRING", string) ).to.be.false;
		expect( isSQLMatch("strung", string) ).to.be.false;
		expect( isSQLMatch("strin",  string) ).to.be.false;
		expect( isSQLMatch("strings",string) ).to.be.false;
		expect( isSQLMatch("stringg",string) ).to.be.false;
		expect( isSQLMatch("sstring",string) ).to.be.false;
		expect( isSQLMatch(" string",string) ).to.be.false;
		expect( isSQLMatch("string ",string) ).to.be.false;
		expect( isSQLMatch("a",      string) ).to.be.false;
		expect( isSQLMatch("",       string) ).to.be.false;

		expect( isSQLMatch("","") ).to.be.true;

		expect( isSQLMatch("a\nb","a\nb") ).to.be.true;

		expect( isSQLMatch(String.raw`\s\t\r\i\n\g`,string) ).to.be.true;
		expect( isSQLMatch("\\s\\t\\r\\i\\n\\g",    string) ).to.be.true;
		expect( isSQLMatch("\\s\\t\\r\\i\\n\\g\\s", string) ).to.be.false;

		expect( isSQLMatch("st\\ring",  "st\\ring") ).to.be.false;
		expect( isSQLMatch("st\\rings", "st\\ring") ).to.be.false;
		expect( isSQLMatch("st\\\\ring","st\\ring") ).to.be.true;

		expect( isSQLMatch(String.raw`\\string`, String.raw`\string`) ).to.be.true;

		expect( isSQLMatch(sentence,sentence) ).to.be.true;
	});



	it(`supports "_" wildcard`, () =>
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

		expect( isSQLMatch("a_b","a\nb") ).to.be.true;

		expect( isSQLMatch("_string", "sstring") ).to.be.true;
		expect( isSQLMatch("_string","ssstring") ).to.be.false;

		expect( isSQLMatch("\\_tring",  "_tring") ).to.be.true;
		expect( isSQLMatch("str\\_ng",  "str_ng") ).to.be.true;
		expect( isSQLMatch("st\\_\\_ng","st__ng") ).to.be.true;
		expect( isSQLMatch("strin\\_",  "strin_") ).to.be.true;

		expect( isSQLMatch(String.raw`string\_`,"string_") ).to.be.true;

		expect( isSQLMatch("________________________________________sentence______string",sentence) ).to.be.true;
	});



	it(`supports "%" wildcard`, () =>
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

		expect( isSQLMatch("a%b","a\nb") ).to.be.true;

		expect( isSQLMatch("%string", "sstring") ).to.be.true;
		expect( isSQLMatch("%string","ssstring") ).to.be.true;

		expect( isSQLMatch("\\%tring",  "%tring") ).to.be.true;
		expect( isSQLMatch("str\\%ng",  "str%ng") ).to.be.true;
		expect( isSQLMatch("st\\%\\%ng","st%%ng") ).to.be.true;
		expect( isSQLMatch("strin\\%",  "strin%") ).to.be.true;

		expect( isSQLMatch(String.raw`string\%`,"string%") ).to.be.true;

		expect( isSQLMatch("%sentence%string",sentence) ).to.be.true;
	});



	it(`supports a mix of "_" and "%" wildcards`, () =>
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

		expect( isSQLMatch("%s_nt_nc_%str_ng",sentence) ).to.be.true;
	});



	it(`does not support "[charlist]" patterns`, () =>
	{
		expect( isSQLMatch("str[i]ng", string) ).to.be.false;
		expect( isSQLMatch("str[i]ng", "str[i]ng") ).to.be.true;
	});



	it(`does not support "?" wildcard`, () =>
	{
		expect( isSQLMatch("str?ng", string) ).to.be.false;
		expect( isSQLMatch("str?ng", "str?ng") ).to.be.true;
	});



	it(`does not support "#" wildcard`, () =>
	{
		expect( isSQLMatch("1#3", "123") ).to.be.false;
		expect( isSQLMatch("1#3", "1#3") ).to.be.true;
	});



	it("ignores an escape character at the end of a pattern", () =>
	{
		expect( isSQLMatch("string\\", string) ).to.be.true;
	});



	it("rejects non-string input", () =>
	{
		const args = ["", 1, true, {}, [], function(){}, null, undefined];

		args.forEach((argA, a) =>
		{
			args.forEach((argB, b) =>
			{
				// Avoid `"" === ""`, as it won't throw
				if (a!==0 || b!==0)
				{
					expect(() => isSQLMatch(argA, argB)).to.throw();
				}
			});
		});
	});
});



describe("sqlToRegex", () =>
{
	it("works", () =>
	{
		expect( sqlToRegex("%ing") ).to.be.a("regexp");
	});



	it("rejects non-string input", () =>
	{
		const args = [1, true, {}, [], function(){}, null, undefined];

		args.forEach(arg => expect(() => sqlToRegex(arg)).to.throw());
	});
});
