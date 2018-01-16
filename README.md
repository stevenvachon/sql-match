# sql-match [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> Match a string using an SQL pattern.

This library is basically a spec-compliant implementation of a `LIKE` between two strings:
```sql
SELECT 'string' LIKE '%ing';  --> true
```

Supported features:
* `%` wildcard sequence
* `_` wildcard
* `\` escape

Unsupported features:
* Custom escape character (`ESCAPE`)
* Ignored trailing spaces (MySQL's `=`)
* Collated international characters (`COLLATE` with `=`)
* `[charlist]` patterns (Access and SQL Server)
* `?` wildcard (Access)


## Installation

[Node.js](http://nodejs.org/) `>= 6` is required. To install, type this at the command line:
```shell
npm install sql-match
```


## Usage

`isSQLMatch(pattern, testString)`

```js
const {isSQLMatch} = require('sql-match');

isSQLMatch('string', 'string');  //-> true

isSQLMatch('%ing', 'string');  //-> true
isSQLMatch('s%ng', 'string');  //-> true
isSQLMatch('str%', 'string');  //-> true

isSQLMatch('_tring', 'string');  //-> true
isSQLMatch('st__ng', 'string');  //-> true
isSQLMatch('strin_', 'string');  //-> true
```

Optionally, you can create a reusable/cacheable regular expression to improve performance:
```js
const {sqlToRegex} = require('sql-match');

const pattern = sqlToRegex('%ing');

['string','stringing'].every(testString => pattern.test(testString));
//-> true
```


## Gotchas

Because JavaScript strings are interpreted, you may want to use [`String.raw`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) to avoid some annoyances that reduce consistency with SQL.

Non-wildcard escape sequences are possible:
```js
isSQLMatch('\t', '	');  //-> true
isSQLMatch('\u0020', ' ');  //-> true
// or
isSQLMatch(String.raw`\t`, 't');  //-> true
isSQLMatch(String.raw`\u0020`, 'u0020');  //-> true
```
```sql
SELECT 't' LIKE '\t';  --> true
SELECT 'u0020' LIKE '\u0020';  --> true
```

Matching a literal wildcard will require you to escape the escape character:
```js
isSQLMatch('\\%trin\\_', '%trin_');  //-> true
// or
isSQLMatch(String.raw`\%trin\_`, '%trin_');  //-> true
```
```sql
SELECT '%trin_' LIKE '\%trin\_';  --> true
```

Matching a literal backslash will require you to escape the escaped escape character:
```js
isSQLMatch('\\\\string', '\\string');  //-> true
// or
isSQLMatch(String.raw`\\string`, String.raw`\string`);  //-> true
```
```sql
SELECT '\string' LIKE '\\string';  --> true
```


[npm-image]: https://img.shields.io/npm/v/sql-match.svg
[npm-url]: https://npmjs.com/package/sql-match
[travis-image]: https://img.shields.io/travis/stevenvachon/sql-match.svg
[travis-url]: https://travis-ci.org/stevenvachon/sql-match
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/sql-match.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/sql-match
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/sql-match.svg
[greenkeeper-url]: https://greenkeeper.io/
