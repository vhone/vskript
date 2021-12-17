import { addListener } from "process";
import { Comparator } from "../../../Java";
import * as StringUtils from '../../util/StringUtils'
import { FileElement, FileSection } from "./File";


// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/log/SkriptLogger.java
/**
 * An object through which Skript can keep track of errors, warnings and other useful information to the one that writes
 * Skript code.
 */
export public class SkriptLogger {
	
	public static readonly LOG_FORMAT: string = '{1} (line {2}: "{3}", {4})';

	/*
     * In decreasing order of priority :
     * ErrorContext.RESTRICTED_SYNTAXES
     * ErrorContext.CONSTRAINT_CHECKING
     * ErrorContext.INITIALIZATION
     * ErrorContext.MATCHING
     * ErrorContext.MATCHING + ErrorContext.RESTRICTED_SYNTAXES
     * ErrorContext.MATCHING + ErrorContext.CONSTRAINT_CHECKING
     * ErrorContext.MATCHING + ErrorContext.INITIALIZATION
     * ErrorContext.MATCHING + ErrorContext.MATCHING
     * ErrorContext.MATCHING + ErrorContext.MATCHING + ErrorContext.RESTRICTED_SYNTAXES
     * ErrorContext.MATCHING + ErrorContext.MATCHING + ErrorContext.CONSTRAINT_CHECKING
     * ErrorContext.MATCHING + ErrorContext.MATCHING + ErrorContext.INITIALIZATION
     * ErrorContext.MATCHING + ErrorContext.MATCHING + ErrorContext.MATCHING
     * ...
     * ErrorContext.MATCHING + ErrorContext.MATCHING + ErrorContext.NO_MATCH
     * ErrorContext.MATCHING + ErrorContext.NO_MATCH
     * ErrorContext.NO_MATCH
     */
	private static readonly ERROR_COMPARATOR: Comparator<LogEntry> = {
		compare: (e1: LogEntry, e2: LogEntry) => {
		let c1 = e1.errorContext;
		let c2 = e2.errorContext;
		if (c1 !== c2) {
			let s1 = c1
				.map(c => c.valueOf().toString())
				.join('');
			let s2 = c2
				.map(c => c.valueOf().toString())
				.join('');
			return StringUtils.compareTo(s1, s2);
		} else {
			return e1.errorType.valueOf() - e2.errorType.valueOf();
		}
	}};

	// State
	private readonly _debug: boolean;
	private _open = true;
	private _hasError = false;
	private readonly _errorContext: ErrorContext[] = [];
	// File
	private _fileName: string;
	private _fileElements: FileElement[];
	private _line = -1;
	// Logs
	private readonly _logEntries: LogEntry[] = [];
	private readonly _logged: LogEntry[] = [];

	constructor()
	constructor(debug: boolean)
	constructor(debug?: boolean) {
		this._debug = debug ? debug: false;
		this._errorContext.push(ErrorContext.MATCHING);
	}

    /**
     * Provides the logger information about the file it's currently parsing
     * @param fileName the file name
     * @param fileElements the {@link FileElement}s of the current file
     */
	public setFileInfo(fileName: string, fileElements: FileElement[]) {
		this._fileName = fileName;
		this._fileElements = flatten(fileElements);
	}

	private flatten(fileElements: FileElement[]): FileElement[] {
		let list: FileElement[] = [];
		for (const element of fileElements) {
			list.push(element);
			if (element instanceof FileSection) {
				list.push(...this.flatten(element.elements));
			}
		}
		return list;
	}

    /**
     * Advances in the currently analysed file. Used to properly display errors.
     */
	 public nextLine() {
        this._line++;
    }

    /**
     * Like {@link #setLine(int)}, is only used for the purposes of the trigger loading priority system.
     * @return the current line
     */
	 public getLine(): number {
        return this._line;
    }

    /**
     * Like {@link #getLine()}, is only used for the purposes of the trigger loading priority system.
     * @param line the new line number
     */
    public setLine(line: number) {
        this._line = line;
    }

    /**
     * Increments the recursion of the logger ; should be called before calling methods that may use SkriptLogger later
     * in execution.
     */
    public recurse() {
        this._errorContext.push(ErrorContext.MATCHING);
    }

    /**
     * Decrements the recursion of the logger ; should be called after calling methods that may use SkriptLogger later
     * in execution.
     */
    public callback() {
        this._errorContext.pop();
    }

    /**
     * Updates the error context, which matters for establishing which errors are the most important
     * @param context the new error context
     */
    public setContext(context: ErrorContext) {
        this._errorContext.pop();
        this._errorContext.push(context);
    }

    private log(message: string, type: LogType, error: ErrorType, tip: string) {
        if (this._open) {
            let ctx: ErrorContext[] = this._errorContext;
            if (this._line == -1) {
                this._logEntries.push(new LogEntry(message, type, this._line, ctx, error, tip));
            } else {
                this._logEntries.push(new LogEntry(
                        StringUtils.format(
                                SkriptLogger.LOG_FORMAT,
                                message,
                                `${this._line + 1}`,
                                this._fileElements[this._line].content,
                                this._fileName),
                        type, this._line, ctx, error, tip
                ));
            }
        }
    }

    /**
     * Logs an error message
     * @param message the error message
     * @param errorType the error type
     */
    public error(message: string, errorType: ErrorType)

    /**
     * Logs an error message with a tip on how to solve it.
     * @param message the error message
     * @param errorType the error type
     * @param tip the tip for solving the error
     */
    public error(message: string, errorType: ErrorType, tip: string)
    
    public error(message: string, errorType: ErrorType, tip?: string) {
        if (!this._hasError) {
            this.clearNotError(); // Errors take priority over everything (except DEBUG), so we just delete all other logs
            this.log(message, LogType.ERROR, errorType, tip);
            this._hasError = true;
        }
    }

    /**
     * Logs a warning message
     * @param message the warning message
     */
    public warn(message: string) {
        this.log(message, LogType.WARNING, null, null);
    }

    /**
     * Logs an info message
     * @param message the info message
     */
    public info(message: string) {
        this.log(message, LogType.INFO, null, null);
    }

    /**
     * Logs a debug message. Will only work if debug mode is enabled.
     * @param message the debug message
     */
    public debug(message: string) {
        if (this._debug)
            this.log(message, LogType.DEBUG, null, null);
    }

    /**
     * Used to "forget" about a previous error, in case it is desirable to take into account multiple errors.
     * Should only be called by the parser.
     */
    public forgetError() {
        this._hasError = false;
    }

    /**
     * Clears every log that is not an error or a debug message.
     */
    public clearNotError() {
        this._logEntries.removeIf(entry -> entry.getErrorContext().size() >= errorContext.size() && entry.getType() != LogType.ERROR && entry.getType() != LogType.DEBUG);
    }

    /**
     * Clears every log that is an error message.
     */
    public void clearErrors() {
        logEntries.removeIf(entry -> entry.getErrorContext().size() >= errorContext.size() && entry.getType() == LogType.ERROR);
        setContext(ErrorContext.MATCHING);
        hasError = false;
    }


    /**
     * Clears every log that is not a debug message.
     */
    public void clearLogs() {
        logEntries.removeIf(entry -> entry.getErrorContext().size() >= errorContext.size() && entry.getType() != LogType.DEBUG);
        setContext(ErrorContext.MATCHING);
        hasError = false;
    }

    /**
     * Finishes a logging process by making some logged entries definitive. All non-error logs are made definitive
     * and only the error that has the most priority is made definitive.
     */
    public void finalizeLogs() {
        logEntries.stream()
                .filter(e -> e.getType() == LogType.ERROR)
                .min(ERROR_COMPARATOR)
                .ifPresent(logged::add);
        for (var entry : logEntries) { // If no errors have been logged, then all other LogTypes get logged here, DEBUG being the special case
            if (entry.getType() != LogType.ERROR) {
                logged.add(entry);
            }
        }
        clearLogs();
    }

    /**
     * Finishes this Logger object, making it impossible to edit.
     * @return the final logged entries
     */
    public List<LogEntry> close() {
        open = false;
        logged.sort((e1, e2) -> { // Due to the load priority system, entries might not be ordered like their corresponding lines
            if (e1.getLine() == -1 || e2.getLine() == -1)
                return 0;
            return e1.getLine() - e2.getLine();
        });
        return logged;
    }

    /**
     * @return whether this Logger is in debug mode
     */
    public boolean isDebug() {
        return debug;
    }

    public String getFileName() {
        return fileName;
    }

    /**
     * @return whether or not this Logger has an error stored
     */
    public boolean hasError() {
        return hasError;
    }

}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/log/LogEntry.java
/**
 * An entry in Skript's log.
 */
export class LogEntry {

	private readonly _type: LogType;
	private readonly _message: string;
	private readonly _line: number;
	private readonly _errorContext: ErrorContext[];
	private readonly _errorType: ErrorType;
	private readonly _tip: string | undefined;

	constructor(message: string, verbosity: LogType, line: number, errorContext: ErrorContext[], errorType: ErrorType)
	constructor(message: string, verbosity: LogType, line: number, errorContext: ErrorContext[], errorType: ErrorType, tip: string)
	constructor(message: string, verbosity: LogType, line: number, errorContext: ErrorContext[], errorType: ErrorType, tip?: string) {
		this._type = verbosity;
		this._message = message;
		this._line = line;
		this._errorContext = errorContext;
		this._errorType = errorType;
		if (this._errorType) this._tip = tip;
	}

	public get message(): string {
		return this._message;
	}
	
	public get type() : LogType {
		return this._type;
	}
	
	public get errorContext() : ErrorContext[] {
		return this._errorContext;
	}
	
	public get errorType() : ErrorType {
		return this._errorType;
	}
	
	public get tip() : string | undefined {
		return this._tip;
	}
	
	public get line() : number {
		return this._line;
	}
	
}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/log/LogType.java
/**
 * An enum describing what a log message can be : an info, a warning, an error or a debug message.
 */
export enum LogType {
    /**
     * The log is a debug message, that should be shown if and only if debug mode is activated, always.
     */
	 DEBUG,
	 /**
	  * The log is an info message, that merely provides additional information/statistics and doesn't call for changes/fixes.
	  */
	 INFO,
	 /**
	  * The log is a warning, that indicates things that should be avoided or might be undesirable, even if they aren't
	  * critical to the point of making the code impossible to run.
	  */
	 WARNING,
	 /**
	  * The log is an error that needs fixing before being able to be run.
	  */
	 ERROR
}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/log/ErrorType.java
/**
 * A type describing an error, mainly used to indicate priority in errors.
 */
 export enum ErrorType {
    /**
     * An exception was thrown. This is used to handle uncaught exceptions while running code.
     */
    EXCEPTION,
    /**
     * There is a semantic error, i.e the error doesn't come from the written input but rather from its underlying logic.
     */
    SEMANTIC_ERROR,
    /**
     * There is a code structure error that has to do with the structure and formatting of sections and triggers inside
     * a Skript file.
     */
    STRUCTURE_ERROR,
    /**
     * The input is malformed, usually due to special characters being wrongly used (unclosed brackets, quotes, etc.)
     */
    MALFORMED_INPUT,
    /**
     * No match was found for the given input.
     */
    NO_MATCH
}



// https://github.com/SkriptLang/skript-parser/blob/master/src/main/java/io/github/syst3ms/skriptparser/log/ErrorContext.java
export enum ErrorContext {
    /**
     * A syntax has been successfully parsed all the way, but it's present in a section that doesn't allow it
     */
    RESTRICTED_SYNTAXES,
    /**
     * A syntax has been successfully initialized, and it's being checked for extra constraints such as type or number
     */
    CONSTRAINT_CHECKING,
    /**
     * A syntax has been successfully matched, and it's being initialized
     */
    INITIALIZATION,
    /**
     * Text is being matched against a pattern
     */
    MATCHING,
    /**
     * Nothing has matched the text
     */
    NO_MATCH
}