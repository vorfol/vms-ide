// Generated from src/msg.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class msgLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly FAO = 4;
	public static readonly TITLE = 5;
	public static readonly IDENT = 6;
	public static readonly PAGE = 7;
	public static readonly FACILITY = 8;
	public static readonly SEVERITY = 9;
	public static readonly BASE = 10;
	public static readonly END = 11;
	public static readonly LITERAL = 12;
	public static readonly QPREFIX = 13;
	public static readonly QSHARED = 14;
	public static readonly QSYSTEM = 15;
	public static readonly QFAOCOUNT = 16;
	public static readonly QIDENTIFICATION = 17;
	public static readonly QUSERVALUE = 18;
	public static readonly QSUCCESS = 19;
	public static readonly QINFORMATIONAL = 20;
	public static readonly QWARNING = 21;
	public static readonly QERROR = 22;
	public static readonly QSEVERE = 23;
	public static readonly QFATAL = 24;
	public static readonly SUCCESS = 25;
	public static readonly INFORMATIONAL = 26;
	public static readonly WARNING = 27;
	public static readonly ERROR = 28;
	public static readonly SEVERE = 29;
	public static readonly FATAL = 30;
	public static readonly WHITESPACE = 31;
	public static readonly NEWLINE = 32;
	public static readonly NAME = 33;
	public static readonly NUMBER = 34;
	public static readonly ZNUMBER = 35;
	public static readonly DQUOTA = 36;
	public static readonly QUOTA = 37;
	public static readonly COMMA = 38;
	public static readonly EQ = 39;
	public static readonly ADD = 40;
	public static readonly SUB = 41;
	public static readonly MUL = 42;
	public static readonly DIV = 43;
	public static readonly BRK_OPEN = 44;
	public static readonly BRK_CLOS = 45;
	public static readonly PUNCTUATION = 46;
	public static readonly ANY = 47;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "DOT", "SLASH", "A", "B", "C", "D", "E", "F", 
		"G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "W", 
		"X", "Y", "Z", "FAOSTART", "FAONUM", "FAONUMSIZE", "FAOCHAR", "FAOSPEC", 
		"FAODIR", "LOWERCASE", "UPPERCASE", "DIGIT", "OPERATORS", "SPECIAL", "NAMESTART", 
		"NAMEREST", "FAO", "TITLE", "IDENT", "PAGE", "FACILITY", "SEVERITY", "BASE", 
		"END", "LITERAL", "QPREFIX", "QSHARED", "QSYSTEM", "QFAOCOUNT", "QIDENTIFICATION", 
		"QUSERVALUE", "QSUCCESS", "QINFORMATIONAL", "QWARNING", "QERROR", "QSEVERE", 
		"QFATAL", "SUCCESS", "INFORMATIONAL", "WARNING", "ERROR", "SEVERE", "FATAL", 
		"WHITESPACE", "NEWLINE", "NAME", "NUMBER", "ZNUMBER", "DQUOTA", "QUOTA", 
		"COMMA", "EQ", "ADD", "SUB", "MUL", "DIV", "BRK_OPEN", "BRK_CLOS", "PUNCTUATION", 
		"ANY",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'!'", "'<'", "'>'", undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"'\"'", "'''", "','", "'='", "'+'", "'-'", "'*'", "'/'", "'('", "')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, "FAO", "TITLE", "IDENT", "PAGE", 
		"FACILITY", "SEVERITY", "BASE", "END", "LITERAL", "QPREFIX", "QSHARED", 
		"QSYSTEM", "QFAOCOUNT", "QIDENTIFICATION", "QUSERVALUE", "QSUCCESS", "QINFORMATIONAL", 
		"QWARNING", "QERROR", "QSEVERE", "QFATAL", "SUCCESS", "INFORMATIONAL", 
		"WARNING", "ERROR", "SEVERE", "FATAL", "WHITESPACE", "NEWLINE", "NAME", 
		"NUMBER", "ZNUMBER", "DQUOTA", "QUOTA", "COMMA", "EQ", "ADD", "SUB", "MUL", 
		"DIV", "BRK_OPEN", "BRK_CLOS", "PUNCTUATION", "ANY",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(msgLexer._LITERAL_NAMES, msgLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return msgLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(msgLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "msg.g4"; }

	// @Override
	public get ruleNames(): string[] { return msgLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return msgLexer._serializedATN; }

	// @Override
	public get modeNames(): string[] { return msgLexer.modeNames; }

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x021\u023D\b\x01" +
		"\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
		"\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
		"\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
		"\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t" +
		"\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t" +
		"\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t" +
		"\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04" +
		"+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x04" +
		"4\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04" +
		"=\t=\x04>\t>\x04?\t?\x04@\t@\x04A\tA\x04B\tB\x04C\tC\x04D\tD\x04E\tE\x04" +
		"F\tF\x04G\tG\x04H\tH\x04I\tI\x04J\tJ\x04K\tK\x04L\tL\x04M\tM\x04N\tN\x04" +
		"O\tO\x04P\tP\x04Q\tQ\x04R\tR\x04S\tS\x04T\tT\x04U\tU\x04V\tV\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03" +
		"\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03" +
		"\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11" +
		"\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x14\x03\x14\x03\x15\x03\x15" +
		"\x03\x16\x03\x16\x03\x17\x03\x17\x03\x18\x03\x18\x03\x19\x03\x19\x03\x1A" +
		"\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x03\x1E" +
		"\x03\x1F\x03\x1F\x03 \x03 \x03!\x03!\x03!\x03!\x03!\x03!\x03!\x03!\x03" +
		"!\x03!\x05!\xF6\n!\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03" +
		"\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x03\"\x05\"\u010A\n" +
		"\"\x03#\x05#\u010D\n#\x03#\x03#\x03#\x03#\x05#\u0113\n#\x03$\x03$\x03" +
		"%\x03%\x03&\x03&\x03\'\x03\'\x03(\x03(\x03)\x03)\x03)\x05)\u0122\n)\x03" +
		"*\x03*\x05*\u0126\n*\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03" +
		"+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03+\x03" +
		"+\x03+\x03+\x03+\x03+\x03+\x05+\u0145\n+\x03,\x03,\x03,\x03,\x03,\x03" +
		",\x03,\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03.\x03.\x03.\x03.\x03.\x03" +
		".\x03/\x03/\x03/\x03/\x03/\x03/\x03/\x03/\x03/\x03/\x030\x030\x030\x03" +
		"0\x030\x030\x030\x030\x030\x030\x031\x031\x031\x031\x031\x031\x032\x03" +
		"2\x032\x032\x032\x033\x033\x033\x033\x033\x033\x033\x033\x033\x034\x03" +
		"4\x034\x034\x034\x034\x034\x034\x035\x035\x035\x035\x035\x035\x035\x03" +
		"5\x036\x036\x036\x036\x036\x036\x036\x036\x037\x037\x037\x037\x037\x03" +
		"7\x037\x037\x037\x037\x037\x038\x038\x038\x038\x038\x038\x038\x038\x03" +
		"8\x038\x038\x038\x038\x038\x038\x038\x039\x039\x039\x039\x039\x039\x03" +
		"9\x039\x039\x039\x039\x039\x03:\x03:\x03:\x03;\x03;\x03;\x03<\x03<\x03" +
		"<\x03=\x03=\x03=\x03>\x03>\x03>\x03?\x03?\x03?\x03@\x03@\x03@\x03@\x03" +
		"@\x03@\x03@\x03@\x03A\x03A\x03A\x03A\x03A\x03A\x03A\x03A\x03A\x03A\x03" +
		"A\x03A\x03A\x03A\x03B\x03B\x03B\x03B\x03B\x03B\x03B\x03B\x03C\x03C\x03" +
		"C\x03C\x03C\x03C\x03D\x03D\x03D\x03D\x03D\x03D\x03D\x03E\x03E\x03E\x03" +
		"E\x03E\x03E\x03F\x06F\u0206\nF\rF\x0EF\u0207\x03G\x05G\u020B\nG\x03G\x03" +
		"G\x05G\u020F\nG\x03H\x03H\x07H\u0213\nH\fH\x0EH\u0216\vH\x03I\x03I\x07" +
		"I\u021A\nI\fI\x0EI\u021D\vI\x03J\x06J\u0220\nJ\rJ\x0EJ\u0221\x03K\x03" +
		"K\x03L\x03L\x03M\x03M\x03N\x03N\x03O\x03O\x03P\x03P\x03Q\x03Q\x03R\x03" +
		"R\x03S\x03S\x03T\x03T\x03U\x03U\x05U\u023A\nU\x03V\x03V\x02\x02\x02W\x03" +
		"\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x02\v\x02\x02\r\x02\x02\x0F\x02" +
		"\x02\x11\x02\x02\x13\x02\x02\x15\x02\x02\x17\x02\x02\x19\x02\x02\x1B\x02" +
		"\x02\x1D\x02\x02\x1F\x02\x02!\x02\x02#\x02\x02%\x02\x02\'\x02\x02)\x02" +
		"\x02+\x02\x02-\x02\x02/\x02\x021\x02\x023\x02\x025\x02\x027\x02\x029\x02" +
		"\x02;\x02\x02=\x02\x02?\x02\x02A\x02\x02C\x02\x02E\x02\x02G\x02\x02I\x02" +
		"\x02K\x02\x02M\x02\x02O\x02\x02Q\x02\x02S\x02\x02U\x02\x06W\x02\x07Y\x02" +
		"\b[\x02\t]\x02\n_\x02\va\x02\fc\x02\re\x02\x0Eg\x02\x0Fi\x02\x10k\x02" +
		"\x11m\x02\x12o\x02\x13q\x02\x14s\x02\x15u\x02\x16w\x02\x17y\x02\x18{\x02" +
		"\x19}\x02\x1A\x7F\x02\x1B\x81\x02\x1C\x83\x02\x1D\x85\x02\x1E\x87\x02" +
		"\x1F\x89\x02 \x8B\x02!\x8D\x02\"\x8F\x02#\x91\x02$\x93\x02%\x95\x02&\x97" +
		"\x02\'\x99\x02(\x9B\x02)\x9D\x02*\x9F\x02+\xA1\x02,\xA3\x02-\xA5\x02." +
		"\xA7\x02/\xA9\x020\xAB\x021\x03\x02$\x04\x02CCcc\x04\x02DDdd\x04\x02E" +
		"Eee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04\x02IIii\x04\x02JJjj\x04\x02" +
		"KKkk\x04\x02NNnn\x04\x02OOoo\x04\x02PPpp\x04\x02QQqq\x04\x02RRrr\x04\x02" +
		"TTtt\x04\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02XXxx\x04\x02YYyy\x04\x02" +
		"ZZzz\x04\x02[[{{\x04\x02\\\\||\x07\x02QQUUWWZZ\\\\\x07\x02CDJLNNSSYY\x05" +
		"\x02##11`a\x03\x02c|\x03\x02C\\\x03\x022;\x07\x02((,-//11BB\x04\x02&&" +
		"aa\x04\x02\v\v\"\"\x03\x023;\x07\x02##..00<=AA\u0237\x02\x03\x03\x02\x02" +
		"\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02U\x03\x02\x02" +
		"\x02\x02W\x03\x02\x02\x02\x02Y\x03\x02\x02\x02\x02[\x03\x02\x02\x02\x02" +
		"]\x03\x02\x02\x02\x02_\x03\x02\x02\x02\x02a\x03\x02\x02\x02\x02c\x03\x02" +
		"\x02\x02\x02e\x03\x02\x02\x02\x02g\x03\x02\x02\x02\x02i\x03\x02\x02\x02" +
		"\x02k\x03\x02\x02\x02\x02m\x03\x02\x02\x02\x02o\x03\x02\x02\x02\x02q\x03" +
		"\x02\x02\x02\x02s\x03\x02\x02\x02\x02u\x03\x02\x02\x02\x02w\x03\x02\x02" +
		"\x02\x02y\x03\x02\x02\x02\x02{\x03\x02\x02\x02\x02}\x03\x02\x02\x02\x02" +
		"\x7F\x03\x02\x02\x02\x02\x81\x03\x02\x02\x02\x02\x83\x03\x02\x02\x02\x02" +
		"\x85\x03\x02\x02\x02\x02\x87\x03\x02\x02\x02\x02\x89\x03\x02\x02\x02\x02" +
		"\x8B\x03\x02\x02\x02\x02\x8D\x03\x02\x02\x02\x02\x8F\x03\x02\x02\x02\x02" +
		"\x91\x03\x02\x02\x02\x02\x93\x03\x02\x02\x02\x02\x95\x03\x02\x02\x02\x02" +
		"\x97\x03\x02\x02\x02\x02\x99\x03\x02\x02\x02\x02\x9B\x03\x02\x02\x02\x02" +
		"\x9D\x03\x02\x02\x02\x02\x9F\x03\x02\x02\x02\x02\xA1\x03\x02\x02\x02\x02" +
		"\xA3\x03\x02\x02\x02\x02\xA5\x03\x02\x02\x02\x02\xA7\x03\x02\x02\x02\x02" +
		"\xA9\x03\x02\x02\x02\x02\xAB\x03\x02\x02\x02\x03\xAD\x03\x02\x02\x02\x05" +
		"\xAF\x03\x02\x02\x02\x07\xB1\x03\x02\x02\x02\t\xB3\x03\x02\x02\x02\v\xB5" +
		"\x03\x02\x02\x02\r\xB7\x03\x02\x02\x02\x0F\xB9\x03\x02\x02\x02\x11\xBB" +
		"\x03\x02\x02\x02\x13\xBD\x03\x02\x02\x02\x15\xBF\x03\x02\x02\x02\x17\xC1" +
		"\x03\x02\x02\x02\x19\xC3\x03\x02\x02\x02\x1B\xC5\x03\x02\x02\x02\x1D\xC7" +
		"\x03\x02\x02\x02\x1F\xC9\x03\x02\x02\x02!\xCB\x03\x02\x02\x02#\xCD\x03" +
		"\x02\x02\x02%\xCF\x03\x02\x02\x02\'\xD1\x03\x02\x02\x02)\xD3\x03\x02\x02" +
		"\x02+\xD5\x03\x02\x02\x02-\xD7\x03\x02\x02\x02/\xD9\x03\x02\x02\x021\xDB" +
		"\x03\x02\x02\x023\xDD\x03\x02\x02\x025\xDF\x03\x02\x02\x027\xE1\x03\x02" +
		"\x02\x029\xE3\x03\x02\x02\x02;\xE5\x03\x02\x02\x02=\xE7\x03\x02\x02\x02" +
		"?\xE9\x03\x02\x02\x02A\xF5\x03\x02\x02\x02C\u0109\x03\x02\x02\x02E\u010C" +
		"\x03\x02\x02\x02G\u0114\x03\x02\x02\x02I\u0116\x03\x02\x02\x02K\u0118" +
		"\x03\x02\x02\x02M\u011A\x03\x02\x02\x02O\u011C\x03\x02\x02\x02Q\u0121" +
		"\x03\x02\x02\x02S\u0125\x03\x02\x02\x02U\u0127\x03\x02\x02\x02W\u0146" +
		"\x03\x02\x02\x02Y\u014D\x03\x02\x02\x02[\u0154\x03\x02\x02\x02]\u015A" +
		"\x03\x02\x02\x02_\u0164\x03\x02\x02\x02a\u016E\x03\x02\x02\x02c\u0174" +
		"\x03\x02\x02\x02e\u0179\x03\x02\x02\x02g\u0182\x03\x02\x02\x02i\u018A" +
		"\x03\x02\x02\x02k\u0192\x03\x02\x02\x02m\u019A\x03\x02\x02\x02o\u01A5" +
		"\x03\x02\x02\x02q\u01B5\x03\x02\x02\x02s\u01C1\x03\x02\x02\x02u\u01C4" +
		"\x03\x02\x02\x02w\u01C7\x03\x02\x02\x02y\u01CA\x03\x02\x02\x02{\u01CD" +
		"\x03\x02\x02\x02}\u01D0\x03\x02\x02\x02\x7F\u01D3\x03\x02\x02\x02\x81" +
		"\u01DB\x03\x02\x02\x02\x83\u01E9\x03\x02\x02\x02\x85\u01F1\x03\x02\x02" +
		"\x02\x87\u01F7\x03\x02\x02\x02\x89\u01FE\x03\x02\x02\x02\x8B\u0205\x03" +
		"\x02\x02\x02\x8D\u020E\x03\x02\x02\x02\x8F\u0210\x03\x02\x02\x02\x91\u0217" +
		"\x03\x02\x02\x02\x93\u021F\x03\x02\x02\x02\x95\u0223\x03\x02\x02\x02\x97" +
		"\u0225\x03\x02\x02\x02\x99\u0227\x03\x02\x02\x02\x9B\u0229\x03\x02\x02" +
		"\x02\x9D\u022B\x03\x02\x02\x02\x9F\u022D\x03\x02\x02\x02\xA1\u022F\x03" +
		"\x02\x02\x02\xA3\u0231\x03\x02\x02\x02\xA5\u0233\x03\x02\x02\x02\xA7\u0235" +
		"\x03\x02\x02\x02\xA9\u0239\x03\x02\x02\x02\xAB\u023B\x03\x02\x02\x02\xAD" +
		"\xAE\x07#\x02\x02\xAE\x04\x03\x02\x02\x02\xAF\xB0\x07>\x02\x02\xB0\x06" +
		"\x03\x02\x02\x02\xB1\xB2\x07@\x02\x02\xB2\b\x03\x02\x02\x02\xB3\xB4\x07" +
		"0\x02\x02\xB4\n\x03\x02\x02\x02\xB5\xB6\x071\x02\x02\xB6\f\x03\x02\x02" +
		"\x02\xB7\xB8\t\x02\x02\x02\xB8\x0E\x03\x02\x02\x02\xB9\xBA\t\x03\x02\x02" +
		"\xBA\x10\x03\x02\x02\x02\xBB\xBC\t\x04\x02\x02\xBC\x12\x03\x02\x02\x02" +
		"\xBD\xBE\t\x05\x02\x02\xBE\x14\x03\x02\x02\x02\xBF\xC0\t\x06\x02\x02\xC0" +
		"\x16\x03\x02\x02\x02\xC1\xC2\t\x07\x02\x02\xC2\x18\x03\x02\x02\x02\xC3" +
		"\xC4\t\b\x02\x02\xC4\x1A\x03\x02\x02\x02\xC5\xC6\t\t\x02\x02\xC6\x1C\x03" +
		"\x02\x02\x02\xC7\xC8\t\n\x02\x02\xC8\x1E\x03\x02\x02\x02\xC9\xCA\t\v\x02" +
		"\x02\xCA \x03\x02\x02\x02\xCB\xCC\t\f\x02\x02\xCC\"\x03\x02\x02\x02\xCD" +
		"\xCE\t\r\x02\x02\xCE$\x03\x02\x02\x02\xCF\xD0\t\x0E\x02\x02\xD0&\x03\x02" +
		"\x02\x02\xD1\xD2\t\x0F\x02\x02\xD2(\x03\x02\x02\x02\xD3\xD4\t\x10\x02" +
		"\x02\xD4*\x03\x02\x02\x02\xD5\xD6\t\x11\x02\x02\xD6,\x03\x02\x02\x02\xD7" +
		"\xD8\t\x12\x02\x02\xD8.\x03\x02\x02\x02\xD9\xDA\t\x13\x02\x02\xDA0\x03" +
		"\x02\x02\x02\xDB\xDC\t\x14\x02\x02\xDC2\x03\x02\x02\x02\xDD\xDE\t\x15" +
		"\x02\x02\xDE4\x03\x02\x02\x02\xDF\xE0\t\x16\x02\x02\xE06\x03\x02\x02\x02" +
		"\xE1\xE2\t\x17\x02\x02\xE28\x03\x02\x02\x02\xE3\xE4\t\x18\x02\x02\xE4" +
		":\x03\x02\x02\x02\xE5\xE6\x07#\x02\x02\xE6<\x03\x02\x02\x02\xE7\xE8\t" +
		"\x19\x02\x02\xE8>\x03\x02\x02\x02\xE9\xEA\t\x1A\x02\x02\xEA@\x03\x02\x02" +
		"\x02\xEB\xEC\x07C\x02\x02\xEC\xF6\x07E\x02\x02\xED\xEE\x07C\x02\x02\xEE" +
		"\xF6\x07F\x02\x02\xEF\xF0\x07C\x02\x02\xF0\xF6\x07H\x02\x02\xF1\xF2\x07" +
		"C\x02\x02\xF2\xF6\x07U\x02\x02\xF3\xF4\x07C\x02\x02\xF4\xF6\x07\\\x02" +
		"\x02\xF5\xEB\x03\x02\x02\x02\xF5\xED\x03\x02\x02\x02\xF5\xEF\x03\x02\x02" +
		"\x02\xF5\xF1\x03\x02\x02\x02\xF5\xF3\x03\x02\x02\x02\xF6B\x03\x02\x02" +
		"\x02\xF7\u010A\t\x1B\x02\x02\xF8\xF9\x07/\x02\x02\xF9\u010A\x07/\x02\x02" +
		"\xFA\u010A\x07-\x02\x02\xFB\xFC\x07\'\x02\x02\xFC\u010A\x07U\x02\x02\xFD" +
		"\xFE\x07\'\x02\x02\xFE\u010A\x07V\x02\x02\xFF\u0100\x07\'\x02\x02\u0100" +
		"\u010A\x07W\x02\x02\u0101\u0102\x07\'\x02\x02\u0102\u010A\x07K\x02\x02" +
		"\u0103\u0104\x07\'\x02\x02\u0104\u010A\x07F\x02\x02\u0105\u0106\x07\'" +
		"\x02\x02\u0106\u010A\x07G\x02\x02\u0107\u0108\x07\'\x02\x02\u0108\u010A" +
		"\x07H\x02\x02\u0109\xF7\x03\x02\x02\x02\u0109\xF8\x03\x02\x02\x02\u0109" +
		"\xFA\x03\x02\x02\x02\u0109\xFB\x03\x02\x02\x02\u0109\xFD\x03\x02\x02\x02" +
		"\u0109\xFF\x03\x02\x02\x02\u0109\u0101\x03\x02\x02\x02\u0109\u0103\x03" +
		"\x02\x02\x02\u0109\u0105\x03\x02\x02\x02\u0109\u0107\x03\x02\x02\x02\u010A" +
		"D\x03\x02\x02\x02\u010B\u010D\x07B\x02\x02\u010C\u010B\x03\x02\x02\x02" +
		"\u010C\u010D\x03\x02\x02\x02\u010D\u0112\x03\x02\x02\x02\u010E\u0113\x05" +
		"A!\x02\u010F\u0110\x05=\x1F\x02\u0110\u0111\x05? \x02\u0111\u0113\x03" +
		"\x02\x02\x02\u0112\u010E\x03\x02\x02\x02\u0112\u010F\x03\x02\x02\x02\u0113" +
		"F\x03\x02\x02\x02\u0114\u0115\t\x1C\x02\x02\u0115H\x03\x02\x02\x02\u0116" +
		"\u0117\t\x1D\x02\x02\u0117J\x03\x02\x02\x02\u0118\u0119\t\x1E\x02\x02" +
		"\u0119L\x03\x02\x02\x02\u011A\u011B\t\x1F\x02\x02\u011BN\x03\x02\x02\x02" +
		"\u011C\u011D\t \x02\x02\u011DP\x03\x02\x02\x02\u011E\u0122\x05G$\x02\u011F" +
		"\u0122\x05I%\x02\u0120\u0122\x05O(\x02\u0121\u011E\x03\x02\x02\x02\u0121" +
		"\u011F\x03\x02\x02\x02\u0121\u0120\x03\x02\x02\x02\u0122R\x03\x02\x02" +
		"\x02\u0123\u0126\x05Q)\x02\u0124\u0126\x05K&\x02\u0125\u0123\x03\x02\x02" +
		"\x02\u0125\u0124\x03\x02\x02\x02\u0126T\x03\x02\x02\x02\u0127\u0144\x05" +
		";\x1E\x02\u0128\u0145\x05E#\x02\u0129\u012A\x05\x91I\x02\u012A\u012B\x05" +
		"E#\x02\u012B\u0145\x03\x02\x02\x02\u012C\u012D\x05\x91I\x02\u012D\u012E" +
		"\x07*\x02\x02\u012E\u012F\x05E#\x02\u012F\u0130\x07+\x02\x02\u0130\u0145" +
		"\x03\x02\x02\x02\u0131\u0132\x05\x91I\x02\u0132\u0133\x07*\x02\x02\u0133" +
		"\u0134\x05\x91I\x02\u0134\u0135\x05E#\x02\u0135\u0136\x07+\x02\x02\u0136" +
		"\u0145\x03\x02\x02\x02\u0137\u0145\x05C\"\x02\u0138\u0139\x05\x93J\x02" +
		"\u0139\u013A\x07\'\x02\x02\u013A\u013B\x07E\x02\x02\u013B\u0145\x03\x02" +
		"\x02\x02\u013C\u013D\x05\x91I\x02\u013D\u013E\x07>\x02\x02\u013E\u0145" +
		"\x03\x02\x02\x02\u013F\u0145\x07@\x02\x02\u0140\u0141\x05\x91I\x02\u0141" +
		"\u0142\x07,\x02\x02\u0142\u0143\x070\x02\x02\u0143\u0145\x03\x02\x02\x02" +
		"\u0144\u0128\x03\x02\x02\x02\u0144\u0129\x03\x02\x02\x02\u0144\u012C\x03" +
		"\x02\x02\x02\u0144\u0131\x03\x02\x02\x02\u0144\u0137\x03\x02\x02\x02\u0144" +
		"\u0138\x03\x02\x02\x02\u0144\u013C\x03\x02\x02\x02\u0144\u013F\x03\x02" +
		"\x02\x02\u0144\u0140\x03\x02\x02\x02\u0145V\x03\x02\x02\x02\u0146\u0147" +
		"\x05\t\x05\x02\u0147\u0148\x05-\x17\x02\u0148\u0149\x05\x1D\x0F\x02\u0149" +
		"\u014A\x05-\x17\x02\u014A\u014B\x05\x1F\x10\x02\u014B\u014C\x05\x15\v" +
		"\x02\u014CX\x03\x02\x02\x02\u014D\u014E\x05\t\x05\x02\u014E\u014F\x05" +
		"\x1D\x0F\x02\u014F\u0150\x05\x13\n\x02\u0150\u0151\x05\x15\v\x02\u0151" +
		"\u0152\x05#\x12\x02\u0152\u0153\x05-\x17\x02\u0153Z\x03\x02\x02\x02\u0154" +
		"\u0155\x05\t\x05\x02\u0155\u0156\x05\'\x14\x02\u0156\u0157\x05\r\x07\x02" +
		"\u0157\u0158\x05\x19\r\x02\u0158\u0159\x05\x15\v\x02\u0159\\\x03\x02\x02" +
		"\x02\u015A\u015B\x05\t\x05\x02\u015B\u015C\x05\x17\f\x02\u015C\u015D\x05" +
		"\r\x07\x02\u015D\u015E\x05\x11\t\x02\u015E\u015F\x05\x1D\x0F\x02\u015F" +
		"\u0160\x05\x1F\x10\x02\u0160\u0161\x05\x1D\x0F\x02\u0161\u0162\x05-\x17" +
		"\x02\u0162\u0163\x057\x1C\x02\u0163^\x03\x02\x02\x02\u0164\u0165\x05\t" +
		"\x05\x02\u0165\u0166\x05+\x16\x02\u0166\u0167\x05\x15\v\x02\u0167\u0168" +
		"\x051\x19\x02\u0168\u0169\x05\x15\v\x02\u0169\u016A\x05)\x15\x02\u016A" +
		"\u016B\x05\x1D\x0F\x02\u016B\u016C\x05-\x17\x02\u016C\u016D\x057\x1C\x02" +
		"\u016D`\x03\x02\x02\x02\u016E\u016F\x05\t\x05\x02\u016F\u0170\x05\x0F" +
		"\b\x02\u0170\u0171\x05\r\x07\x02\u0171\u0172\x05+\x16\x02\u0172\u0173" +
		"\x05\x15\v\x02\u0173b\x03\x02\x02\x02\u0174\u0175\x05\t\x05\x02\u0175" +
		"\u0176\x05\x15\v\x02\u0176\u0177\x05#\x12\x02\u0177\u0178\x05\x13\n\x02" +
		"\u0178d\x03\x02\x02\x02\u0179\u017A\x05\t\x05\x02\u017A\u017B\x05\x1F" +
		"\x10\x02\u017B\u017C\x05\x1D\x0F\x02\u017C\u017D\x05-\x17\x02\u017D\u017E" +
		"\x05\x15\v\x02\u017E\u017F\x05)\x15\x02\u017F\u0180\x05\r\x07\x02\u0180" +
		"\u0181\x05\x1F\x10\x02\u0181f\x03\x02\x02\x02\u0182\u0183\x05\v\x06\x02" +
		"\u0183\u0184\x05\'\x14\x02\u0184\u0185\x05)\x15\x02\u0185\u0186\x05\x15" +
		"\v\x02\u0186\u0187\x05\x17\f\x02\u0187\u0188\x05\x1D\x0F\x02\u0188\u0189" +
		"\x055\x1B\x02\u0189h\x03\x02\x02\x02\u018A\u018B\x05\v\x06\x02\u018B\u018C" +
		"\x05+\x16\x02\u018C\u018D\x05\x1B\x0E\x02\u018D\u018E\x05\r\x07\x02\u018E" +
		"\u018F\x05)\x15\x02\u018F\u0190\x05\x15\v\x02\u0190\u0191\x05\x13\n\x02" +
		"\u0191j\x03\x02\x02\x02\u0192\u0193\x05\v\x06\x02\u0193\u0194\x05+\x16" +
		"\x02\u0194\u0195\x057\x1C\x02\u0195\u0196\x05+\x16\x02\u0196\u0197\x05" +
		"-\x17\x02\u0197\u0198\x05\x15\v\x02\u0198\u0199\x05!\x11\x02\u0199l\x03" +
		"\x02\x02\x02\u019A\u019B\x05\v\x06\x02\u019B\u019C\x05\x17\f\x02\u019C" +
		"\u019D\x05\r\x07\x02\u019D\u019E\x05%\x13\x02\u019E\u019F\x07a\x02\x02" +
		"\u019F\u01A0\x05\x11\t\x02\u01A0\u01A1\x05%\x13\x02\u01A1\u01A2\x05/\x18" +
		"\x02\u01A2\u01A3\x05#\x12\x02\u01A3\u01A4\x05-\x17\x02\u01A4n\x03\x02" +
		"\x02\x02\u01A5\u01A6\x05\v\x06\x02\u01A6\u01A7\x05\x1D\x0F\x02\u01A7\u01A8" +
		"\x05\x13\n\x02\u01A8\u01A9\x05\x15\v\x02\u01A9\u01AA\x05#\x12\x02\u01AA" +
		"\u01AB\x05-\x17\x02\u01AB\u01AC\x05\x1D\x0F\x02\u01AC\u01AD\x05\x17\f" +
		"\x02\u01AD\u01AE\x05\x1D\x0F\x02\u01AE\u01AF\x05\x11\t\x02\u01AF\u01B0" +
		"\x05\r\x07\x02\u01B0\u01B1\x05-\x17\x02\u01B1\u01B2\x05\x1D\x0F\x02\u01B2" +
		"\u01B3\x05%\x13\x02\u01B3\u01B4\x05#\x12\x02\u01B4p\x03\x02\x02\x02\u01B5" +
		"\u01B6\x05\v\x06\x02\u01B6\u01B7\x05/\x18\x02\u01B7\u01B8\x05+\x16\x02" +
		"\u01B8\u01B9\x05\x15\v\x02\u01B9\u01BA\x05)\x15\x02\u01BA\u01BB\x07a\x02" +
		"\x02\u01BB\u01BC\x051\x19\x02\u01BC\u01BD\x05\r\x07\x02\u01BD\u01BE\x05" +
		"\x1F\x10\x02\u01BE\u01BF\x05/\x18\x02\u01BF\u01C0\x05\x15\v\x02\u01C0" +
		"r\x03\x02\x02\x02\u01C1\u01C2\x05\v\x06\x02\u01C2\u01C3\x05\x7F@\x02\u01C3" +
		"t\x03\x02\x02\x02\u01C4\u01C5\x05\v\x06\x02\u01C5\u01C6\x05\x81A\x02\u01C6" +
		"v\x03\x02\x02\x02\u01C7\u01C8\x05\v\x06\x02\u01C8\u01C9\x05\x83B\x02\u01C9" +
		"x\x03\x02\x02\x02\u01CA\u01CB\x05\v\x06\x02\u01CB\u01CC\x05\x85C\x02\u01CC" +
		"z\x03\x02\x02\x02\u01CD\u01CE\x05\v\x06\x02\u01CE\u01CF\x05\x87D\x02\u01CF" +
		"|\x03\x02\x02\x02\u01D0\u01D1\x05\v\x06\x02\u01D1\u01D2\x05\x89E\x02\u01D2" +
		"~\x03\x02\x02\x02\u01D3\u01D4\x05+\x16\x02\u01D4\u01D5\x05/\x18\x02\u01D5" +
		"\u01D6\x05\x11\t\x02\u01D6\u01D7\x05\x11\t\x02\u01D7\u01D8\x05\x15\v\x02" +
		"\u01D8\u01D9\x05+\x16\x02\u01D9\u01DA\x05+\x16\x02\u01DA\x80\x03\x02\x02" +
		"\x02\u01DB\u01DC\x05\x1D\x0F\x02\u01DC\u01DD\x05#\x12\x02\u01DD\u01DE" +
		"\x05\x17\f\x02\u01DE\u01DF\x05%\x13\x02\u01DF\u01E0\x05)\x15\x02\u01E0" +
		"\u01E1\x05!\x11\x02\u01E1\u01E2\x05\r\x07\x02\u01E2\u01E3\x05-\x17\x02" +
		"\u01E3\u01E4\x05\x1D\x0F\x02\u01E4\u01E5\x05%\x13\x02\u01E5\u01E6\x05" +
		"#\x12\x02\u01E6\u01E7\x05\r\x07\x02\u01E7\u01E8\x05\x1F\x10\x02\u01E8" +
		"\x82\x03\x02\x02\x02\u01E9\u01EA\x053\x1A\x02\u01EA\u01EB\x05\r\x07\x02" +
		"\u01EB\u01EC\x05)\x15\x02\u01EC\u01ED\x05#\x12\x02\u01ED\u01EE\x05\x1D" +
		"\x0F\x02\u01EE\u01EF\x05#\x12\x02\u01EF\u01F0\x05\x19\r\x02\u01F0\x84" +
		"\x03\x02\x02\x02\u01F1\u01F2\x05\x15\v\x02\u01F2\u01F3\x05)\x15\x02\u01F3" +
		"\u01F4\x05)\x15\x02\u01F4\u01F5\x05%\x13\x02\u01F5\u01F6\x05)\x15\x02" +
		"\u01F6\x86\x03\x02\x02\x02\u01F7\u01F8\x05+\x16\x02\u01F8\u01F9\x05\x15" +
		"\v\x02\u01F9\u01FA\x051\x19\x02\u01FA\u01FB\x05\x15\v\x02\u01FB\u01FC" +
		"\x05)\x15\x02\u01FC\u01FD\x05\x15\v\x02\u01FD\x88\x03\x02\x02\x02\u01FE" +
		"\u01FF\x05\x17\f\x02\u01FF\u0200\x05\r\x07\x02\u0200\u0201\x05-\x17\x02" +
		"\u0201\u0202\x05\r\x07\x02\u0202\u0203\x05\x1F\x10\x02\u0203\x8A\x03\x02" +
		"\x02\x02\u0204\u0206\t!\x02\x02\u0205\u0204\x03\x02\x02\x02\u0206\u0207" +
		"\x03\x02\x02\x02\u0207\u0205\x03\x02\x02\x02\u0207\u0208\x03\x02\x02\x02" +
		"\u0208\x8C\x03\x02\x02\x02\u0209\u020B\x07\x0F\x02\x02\u020A\u0209\x03" +
		"\x02\x02\x02\u020A\u020B\x03\x02\x02\x02\u020B\u020C\x03\x02\x02\x02\u020C" +
		"\u020F\x07\f\x02\x02\u020D\u020F\x07\f\x02\x02\u020E\u020A\x03\x02\x02" +
		"\x02\u020E\u020D\x03\x02\x02\x02\u020F\x8E\x03\x02\x02\x02\u0210\u0214" +
		"\x05Q)\x02\u0211\u0213\x05S*\x02\u0212\u0211\x03\x02\x02\x02\u0213\u0216" +
		"\x03\x02\x02\x02\u0214\u0212\x03\x02\x02\x02\u0214\u0215\x03\x02\x02\x02" +
		"\u0215\x90\x03\x02\x02\x02\u0216\u0214\x03\x02\x02\x02\u0217\u021B\t\"" +
		"\x02\x02\u0218\u021A\x05K&\x02\u0219\u0218\x03\x02\x02\x02\u021A\u021D" +
		"\x03\x02\x02\x02\u021B\u0219\x03\x02\x02\x02\u021B\u021C\x03\x02\x02\x02" +
		"\u021C\x92\x03\x02\x02\x02\u021D\u021B\x03\x02\x02\x02\u021E\u0220\x05" +
		"K&\x02\u021F\u021E\x03\x02\x02\x02\u0220\u0221\x03\x02\x02\x02\u0221\u021F" +
		"\x03\x02\x02\x02\u0221\u0222\x03\x02\x02\x02\u0222\x94\x03\x02\x02\x02" +
		"\u0223\u0224\x07$\x02\x02\u0224\x96\x03\x02\x02\x02\u0225\u0226\x07)\x02" +
		"\x02\u0226\x98\x03\x02\x02\x02\u0227\u0228\x07.\x02\x02\u0228\x9A\x03" +
		"\x02\x02\x02\u0229\u022A\x07?\x02\x02\u022A\x9C\x03\x02\x02\x02\u022B" +
		"\u022C\x07-\x02\x02\u022C\x9E\x03\x02\x02\x02\u022D\u022E\x07/\x02\x02" +
		"\u022E\xA0\x03\x02\x02\x02\u022F\u0230\x07,\x02\x02\u0230\xA2\x03\x02" +
		"\x02\x02\u0231\u0232\x071\x02\x02\u0232\xA4\x03\x02\x02\x02\u0233\u0234" +
		"\x07*\x02\x02\u0234\xA6\x03\x02\x02\x02\u0235\u0236\x07+\x02\x02\u0236";
	private static readonly _serializedATNSegment1: string =
		"\xA8\x03\x02\x02\x02\u0237\u023A\t#\x02\x02\u0238\u023A\x05M\'\x02\u0239" +
		"\u0237\x03\x02\x02\x02\u0239\u0238\x03\x02\x02\x02\u023A\xAA\x03\x02\x02" +
		"\x02\u023B\u023C\v\x02\x02\x02\u023C\xAC\x03\x02\x02\x02\x11\x02\xF5\u0109" +
		"\u010C\u0112\u0121\u0125\u0144\u0207\u020A\u020E\u0214\u021B\u0221\u0239" +
		"\x02";
	public static readonly _serializedATN: string = Utils.join(
		[
			msgLexer._serializedATNSegment0,
			msgLexer._serializedATNSegment1,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!msgLexer.__ATN) {
			msgLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(msgLexer._serializedATN));
		}

		return msgLexer.__ATN;
	}

}

