"use strict";
const escapeRegex = require("escape-string-regexp");
const isString = require("is-string");

const REGEX_SEQUENCED_WILDCARD = "[^]*";
const REGEX_SINGLE_WILDCARD = "[^]";
const SQL_ESCAPE = "\\";
const SQL_SEQUENCED_WILDCARD = "%";
const SQL_SINGLE_WILDCARD = "_";



const isSQLMatch = (pattern, test) =>
{
	if (!isString(test))
	{
		throw new Error("Input must be a string");
	}

	return sqlToRegex(pattern).test(test);
};



const sqlToRegex = pattern =>
{
	if (!isString(pattern))
	{
		throw new Error("Input must be a string");
	}

	const lastIndex = pattern.length - 1;
	let escaping = false;
	let i = -1;
	let regex = "";
	let sequencing = false;

	while (true)
	{
		const char = pattern[++i];

		if (char!==SQL_SEQUENCED_WILDCARD && sequencing)
		{
			i--;
			regex += REGEX_SEQUENCED_WILDCARD;
			sequencing = false;
		}
		else if (i > lastIndex)
		{
			return new RegExp(`^${regex}$`);
		}
		else if (escaping)
		{
			escaping = false;
			regex += escapeRegex(char);
		}
		else if (char === SQL_ESCAPE)
		{
			escaping = true;
		}
		else if (char === SQL_SINGLE_WILDCARD)
		{
			regex += REGEX_SINGLE_WILDCARD;
		}
		else if (char===SQL_SEQUENCED_WILDCARD && !sequencing)
		{
			sequencing = true;
		}
		else if (char===SQL_SEQUENCED_WILDCARD && sequencing)
		{
			// Ignore consecutive instances
		}
		else
		{
			regex += escapeRegex(char);
		}
	}
};



module.exports = { isSQLMatch, sqlToRegex };
