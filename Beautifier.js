/*
	Code Beautifier Class v0.1a
	Author: Andy Deveaux
	Description: Formats unformatted code
	
	<LICENSE>
		Copyright (C) 2011 Andy Deveaux
	
		This program is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.
	
		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.
	
		You should have received a copy of the GNU General Public License
		along with this program.  If not, see <http://www.gnu.org/licenses/>.
	</LICENSE>
*/

function Beautifier()
{
	// constants
	// - language constants
	this.LANG_HTML  = 0;
	this.LANG_OTHER = 1;
	// - side constants
	this.SIDE_LEFT  = 0;
	this.SIDE_RIGHT = 1;
	this.SIDE_BOTH  = 2;
	// - newline constants
	this.NEWLINE_WINDOWS = "\r\n";
	this.NEWLINE_UNIX    = "\n";

	
	// fields
	this.tab      = "\t";						// tab string (hard or soft tabs)
	this.language = this.LANG_OTHER;
	this.code     = "";							// code to beautify
	this.newline  = this.NEWLINE_WINDOWS;		// newline character 
	
	// methods
	this.setSoftTab = function(size)		// this function sets the option to use soft tabs, and how many spaces for it
	{
		this.tab = this.repeat(" ", size);
	}
	
	this.setHardTab = function()		// function to set the option to use hard tabs
	{
		this.tab = "\t";
	}
	
	this.setLanguage = function(lang)
	{
	   lang = lang.toLowerCase();
		switch (lang)
		{
			case "html":
				this.language = this.LANG_HTML;
				break;
			default:
				this.language = this.LANG_OTHER;
		}
	}
	
	this.setNewline = function(os)
	{
		os = os.toLowerCase();
		if (os == "unix")
			this.newline = this.NEWLINE_UNIX;
		
		else if (os == "windows")
			this.newline = this.NEWLINE_WINDOWS;
	}
	
	this.repeat = function(str, times)			// repeats a string a set number of times
	{
		var output = "";
		
		for (var i=0; i<times; i++)
			output += str;
		
		return output;
	}
	
	this.replaceAll = function(haystack, needle, replacement)			// replaces all instances of needle with replacement
	{
		var regex = new RegExp(needle, "g");
		return haystack.replace(regex, replacement);
	}
	
	this.insert = function(str, str2, pos)
	{
		return str.substring(0, pos) + str2 + str.substring(pos, str.length);
	}
	
	this.parse = function()				// parses a string into an array, but ignores if in a string literal
	{
		var parsed = [];
		var literal = false;			// inside string quotes or not
		var start = 0;
		
		if (this.language == this.LANG_HTML)
		{
			// parsing HTML will require more work with substrings
			// search for the start of tags "<" and find the matching ">" character
			var end = 0;
			
			start = this.code.indexOf("<");
			while (start > -1)
			{
				end = this.code.indexOf(">", start+1);
				if (end == -1)
					end = this.code.length-1;
				else
					end = end + 1;
				
				var tag = this.code.substring(start, end);
				parsed.push(tag);
				
				// get next tag
				start = this.code.indexOf("<", end);
				
				// get the stuff between the tags
				var between = "";
				if (start == -1)
					between = this.code.substring(end, this.code.length);
				else
					between = this.code.substring(end, start);
				
				if (this.trim(between) != "")
					parsed.push(between);
			}
		
		}
		
		else if (this.language == this.LANG_OTHER)
		{
			for (var i=0; i<this.code.length; i++)
			{
				if (i == this.code.length-1)		// on the last iteration
				{
					parsed.push(this.code.substring(start, this.code.length));
					break;
				}
					
				
				var c = this.code.charAt(i);
				if (c == "\"")
				{
					// check for escaped quotes
					if (i > 0 && this.code.charAt(i-1) != "\\")
					{
						if (literal)
							literal = false;
						else
							literal = true;
					}
					
					continue;
				}
				
				if (!literal)
				{
					if (c == ";")
					{
						parsed.push(this.code.substring(start, i+1));
						start = i+1;
					}
					
					else if (c == "{" || c == "}")
					{
						// don't add blank lines to the array
						var line = this.code.substring(start, i);
						if (this.trim(line) != "")
							parsed.push(this.code.substring(start, i));
						
						parsed.push(c);
						start = i+1;
					}
					
					// pad equal signs
					else if (c == "=")
					{
						// check if the previous and next characters are equal signs
						if (i == 0)
							continue;
						var prev = this.code.charAt(i-1);
						
						if (i == this.code.length)
							continue;
						var next = this.code.charAt(i+1);
						
						if (prev != "=" && prev != " ")
						{
							this.code = this.insert(this.code, " ", i);
							i++;
						}
						
						if (next != "=" && next != " ")
						{
							this.code = this.insert(this.code, " ", i+1);
							i++;
						}
					}
					
				}
			}	// end of for loop
									
		}		// end of if
		
		return parsed;
	}
	
	this.trim = function(input, side)
	{
		if (side == this.SIDE_LEFT)
			return input.replace(/^\s*/, "");
		
		else if (side == this.SIDE_RIGHT)
			return input.replace(/\s*$/, "");
		
		else
			return input.replace(/^\s*|\s*$/g, "");
	}
	
	this.beautify = function(code)				// main beautify code
	{		
		this.code = this.replaceAll(code, "\n|\r\n", "");
		var parsed = [];
		var indent = 0;				// keeps track of the number of tabs to insert for a new line
		
		var parsed = this.parse();
		if (this.language == this.LANG_HTML)
		{
			for (var i=0; i<parsed.length; i++)
			{
				parsed[i] = this.trim(parsed[i], this.SIDE_BOTH);

				// make sure we're not on a single tag element
				var find = parsed[i].indexOf("/>");				
				
				if (parsed[i].charAt(0) == "<" && find == -1)
				{
					if (parsed[i].charAt(1) == "/")		// ending tag
					{
						indent--;
						parsed[i] = this.repeat(this.tab, indent) + parsed[i];
					}
					else								// not ending tag
					{
						parsed[i] = this.repeat(this.tab, indent) + parsed[i];
						indent++;
					}	
				}
				else
				{
					parsed[i] = this.repeat(this.tab, indent) + parsed[i];
				}
				
			}	// end of for loop
			
			
		}
			// other
		else if (this.language == this.LANG_OTHER)
		{
			for (var i=0; i<parsed.length; i++)
			{
				parsed[i] = this.trim(parsed[i], this.SIDE_BOTH);
				
				if (parsed[i] == "{")
				{
					parsed[i] = this.repeat(this.tab, indent) + parsed[i];
					indent++;
					continue;
				}
					
				else if (parsed[i] == "}")
				{
					if (indent > 0)
						indent--;
						
					parsed[i] = this.repeat(this.tab, indent) + parsed[i];
					continue;
				}
					
				else
				{
					parsed[i] = this.repeat(this.tab, indent) + parsed[i];
				}
			}	// end of for loop				
		}
		
		return parsed.join(this.newline);
	}
	
}