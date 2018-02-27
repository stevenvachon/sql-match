"use strict";
const escapeRegex = require("escape-string-regexp");
const isString = require("is-string");

const REGEX_SEQUENCED_WILDCARD = "[^]*";
const REGEX_SINGLE_WILDCARD = "[^]";
const SQL_ESCAPE = "\\";
const SQL_SEQUENCED_WILDCARD = "%";
const SQL_SINGLE_WILDCARD = "_";

const token = /[\\%_]|[^\\%_]+/g;



const isSQLMatch = (pattern, test) =>
{
	if (!isString(test))
	{
		throw new TypeError("Input must be a string");
	}

	return sqlToRegex(pattern).test(test);
};



const sqlToRegex = pattern =>
{
	if (!isString(pattern))
	{
		throw new TypeError("Input must be a string");
	}

	let regex = "";
	let match;

	loop: while ((match = token.exec(pattern)) !== null)
	{
		switch (match[0])
		{
			case SQL_ESCAPE:
			{
				if ((match = token.exec(pattern)) === null)
				{
					break loop;
				}

				regex += escapeRegex(match[0]);
				break;
			}
			case SQL_SEQUENCED_WILDCARD:
			{
				regex += REGEX_SEQUENCED_WILDCARD;
				break;
			}
			case SQL_SINGLE_WILDCARD:
			{
				regex += REGEX_SINGLE_WILDCARD;
				break;
			}
			default:
			{
				regex += escapeRegex(match[0]);
			}
		}
	}

	return new RegExp(`^${regex}$`);
};



module.exports = { isSQLMatch, sqlToRegex };
