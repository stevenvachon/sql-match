"use strict";
const isString = require("is-string");

const CHAR_ESCAPE = "\\";
const CHAR_SEQUENCED_WILDCARD = "%";
const CHAR_SINGLE_WILDCARD = "_";
const EVENT_BEFORE_CHAR = "beforeChar";
const EVENT_COMPLETE = "complete";
const EVENT_LITERAL = "literal";
const EVENT_SEQUENCED_WILDCARD = "sequencedWildcard";
const EVENT_SINGLE_WILDCARD = "singleWildcard";



class PatternTokenizer
{
	constructor()
	{
		this.handlers =
		{
			[EVENT_BEFORE_CHAR]: [],
			[EVENT_COMPLETE]: [],
			[EVENT_LITERAL]: [],
			[EVENT_SEQUENCED_WILDCARD]: [],
			[EVENT_SINGLE_WILDCARD]: []
		};
	}

	emit(event, ...args)
	{
		this.handlers[event].forEach(handler => handler(...args));
	}

	emitWithBefore(event, ...args)
	{
		this.emit(EVENT_BEFORE_CHAR);

		// If not stopped within EVENT_BEFORE_CHAR handler
		if (this.proceed)
		{
			this.emit(event, ...args);
		}
	}

	lookAhead(pattern, startIndex)
	{
		let nextLiteral;
		let numSubsequents = 0;

		new PatternTokenizer()
			.on(EVENT_LITERAL, patternChar =>
			{
				if (nextLiteral === undefined)
				{
					nextLiteral = patternChar;
				}

				numSubsequents++;
			})
			.on(EVENT_SINGLE_WILDCARD, () => numSubsequents++)
			.start( pattern.slice(startIndex) );

		return { nextLiteral, numSubsequents };
	}

	on(event, handler)
	{
		this.handlers[event].push(handler);
		return this;  // chain support
	}

	start(pattern)
	{
		const lastIndex = pattern.length - 1;
		let escaping = false;
		let i = -1;
		let sequencing = false;

		this.proceed = true;

		while (this.proceed)
		{
			const char = pattern[++i];

			if (char!==CHAR_SEQUENCED_WILDCARD && sequencing)
			{
				const {nextLiteral, numSubsequents} = this.lookAhead(pattern, i);

				this.emitWithBefore(EVENT_SEQUENCED_WILDCARD, nextLiteral, numSubsequents);

				sequencing = false;
			}

			// If already checked last character or was stopped within EVENT_SEQUENCED_WILDCARD
			if (i > lastIndex || !this.proceed)
			{
				this.emit(EVENT_COMPLETE);
				this.proceed = false;
			}
			else if (escaping)
			{
				this.emitWithBefore(EVENT_LITERAL, char);
				escaping = false;
			}
			else if (char === CHAR_ESCAPE)
			{
				escaping = true;
			}
			else if (char === CHAR_SINGLE_WILDCARD)
			{
				this.emitWithBefore(EVENT_SINGLE_WILDCARD);
			}
			else if (char===CHAR_SEQUENCED_WILDCARD && !sequencing)
			{
				sequencing = true;
			}
			else if (char===CHAR_SEQUENCED_WILDCARD && sequencing)
			{
				// Ignore consecutive instances
			}
			else
			{
				this.emitWithBefore(EVENT_LITERAL, char);
			}
		}
	}

	stop()
	{
		this.proceed = false;
	}
}



const isSQLMatch = (pattern, test) =>
{
	if (!isString(pattern) || !isString(test))
	{
		throw new Error("Input must be a string");
	}

	const lastTestIndex = test.length - 1;
	const tokenizer = new PatternTokenizer();
	let result = false;
	let testIndex = -1;
	let testChar;

	tokenizer
		.on(EVENT_BEFORE_CHAR, () =>
		{
			if (testIndex+1 > lastTestIndex)
			{
				tokenizer.stop();
			}
			else
			{
				testChar = test[++testIndex];
			}
		})
		.on(EVENT_LITERAL, patternChar =>
		{
			if (testChar !== patternChar)
			{
				tokenizer.stop();
			}
		})
		.on(EVENT_SEQUENCED_WILDCARD, (nextLiteral, numSubsequents) =>
		{
			// If beyond searchable range (due to necessary subsequent characters)
			if (testIndex > lastTestIndex - numSubsequents)
			{
				// Skip this metacharacter
				testIndex--;
			}
			else
			{
				const startIndex = testIndex;

				do
				{
					if (test[testIndex] === nextLiteral)
					{
						break;
					}
				}
				while (++testIndex <= lastTestIndex - numSubsequents);

				if (testIndex !== startIndex)
				{
					// Undo last increment
					testIndex--;
				}
			}
		})
		.on(EVENT_COMPLETE, () =>
		{
			if (testIndex === lastTestIndex)
			{
				result = true;
			}
		})
		.start(pattern);

	return result;
};



module.exports = isSQLMatch;
