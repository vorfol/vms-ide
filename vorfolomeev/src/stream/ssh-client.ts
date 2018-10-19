import { Client, ConnectConfig } from "ssh2";
import { Lock } from "../common/lock";
import { LogType } from "../common/log-type";
import { IUnSubscribe, Subscribe } from "../common/subscribe";
import { IConnectConfigResolver } from "../config-resolve/connect-config-resolver";

export class SshClient {
    public lastClientError?: Error;

    protected client?: Client;

    private clientReady?: IUnSubscribe;
    private clientError?: IUnSubscribe;
    private clientEnd?: IUnSubscribe;

    /**
     * No auto closing client anymore, use dispose()
     * @param config configuration
     * @param resolver config resolver
     * @param debugLog like console.log
     * @param tag for logging usage
     */
    constructor(public config: ConnectConfig,
                public resolver?: IConnectConfigResolver,
                public debugLog?: LogType,
                public tag?: string) {
    }

    public dispose() {
        if (this.client) {
            this.client.end();
        }
        this.cleanClient();
    }

    protected cleanClient() {
        if (this.clientReady) {
            this.clientReady.unsubscribe();
            delete this.clientReady;
        }
        if (this.clientError) {
            this.clientError.unsubscribe();
            delete this.clientError;
        }
        if (this.clientEnd) {
            this.clientEnd.unsubscribe();
            delete this.clientEnd;
        }
        delete this.client;
    }

    protected async ensureClient() {
        if (!this.client) {
            return await this.clientConnect();
        }
        return true;
    }

    private async clientConnect() {
        const waitClient = new Lock(true, "waitClient");
        const client = new Client();
        this.clientReady = Subscribe(client, "ready", () => {
            if (this.debugLog) {
                this.debugLog(`client${this.tag ? " " + this.tag : ""} ready`);
            }
            waitClient.release();
            this.client = client;
            // subscribe "end" only here
            this.clientEnd = Subscribe(client, "end", () => {
                if (this.debugLog) {
                    this.debugLog(`client${this.tag ? " " + this.tag : ""} end`);
                }
                this.cleanClient();
            });
        });
        this.clientError = Subscribe(client, "error", (err) => {
            this.lastClientError = err;
            if (this.debugLog) {
                this.debugLog(`client${this.tag ? " " + this.tag : ""} error: ${err}`);
            }
            if (!this.client) {
                waitClient.release();
            }
        });
        // resolve config now and there
        if (this.resolver) {
            const configResolved = await this.resolver.resolveConnectConfig(this.config);
            if (configResolved) {
                client.connect(configResolved);
            } else {
                if (this.debugLog) {
                    this.debugLog(`no config resolved`);
                }
                waitClient.release();
            }
        } else {
            client.connect(this.config);
        }
        await waitClient.acquire();
        const connected = this.client !== undefined;
        if (this.resolver) {
            this.resolver.feedBack(this.config, connected);
        }
        return connected;
    }
}
