import { Transform } from "stream";
import { LogFunction, LogType } from "@vorfol/common";

import { IShellParser } from "../api";

import * as nls from "vscode-nls";
nls.config({messageFormat: nls.MessageFormat.both});
const localize = nls.loadMessageBundle();

export class ShellParser extends Transform implements IShellParser {
    
    public content = "";
    public readyEvent = Symbol("ready");
    public lastError?: Error;
    public logFn: LogFunction;

    protected timer?: NodeJS.Timer;
    
    constructor(public timeout?: number, logFn?: LogFunction, public tag?: string) {
        super();
        // tslint:disable-next-line:no-empty
        this.logFn = logFn || (() => {});
        this.on("close", () => {
            this.logFn(LogType.debug, () => localize("debug.closed", "ShellParser{0}: closed", this.tag ? " " + this.tag : ""));
            this.setReady();
        });
        this.on("error", (err) => {
            this.lastError = err;
            this.logFn(LogType.debug, () => localize("debug.error", "ShellParser{1}: error {0}", err.message, this.tag ? " " + this.tag : ""));
            this.setReady();
        });
        // this.setupTimer();
    }

    public prepare() {
        this.content = "";
        this.lastError = undefined;
    }

    /**
     * Collects content and call callback in any case
     * @param chunk buffer
     * @param encoding encoding
     * @param callback callback
     */
    public _transform(chunk: any, encoding: string, callback: Function) {
        this.logFn(LogType.debug, () => localize("debug.chunk", "ShellParser{0}: got chunk", this.tag ? " " + this.tag : ""));
        if (Buffer.isBuffer(chunk)) {
            const strData = chunk.toString("utf8");
            this.logFn(LogType.debug, () => `${strData}`); 
            this.content += strData;
        } else {
            this.logFn(LogType.debug, () => localize("debug.nobuf", "ShellParser{0}: chunk is not Buffer", this.tag ? " " + this.tag : ""));
        }
        this.setupTimer();
        callback();
    }

    protected setReady() {
        const readyContent = this.content;
        setImmediate(() => this.emit(this.readyEvent, readyContent));
        this.content = "";
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        this.logFn(LogType.debug, () => localize("debug.ready", "ShellParser{0}: set ready", this.tag ? " " + this.tag : ""));
    }

    protected setupTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        if (this.timeout) {
            this.timer = setTimeout(() => {
                this.logFn(LogType.debug, () => localize("debug.timeout", "ShellParser{0}: timeout", this.tag ? " " + this.tag : ""));
                this.timer = undefined;
                this.setReady();
            }, this.timeout);
        }
    }
}
