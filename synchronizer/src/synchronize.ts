import { ExtensionContext, window, workspace } from "vscode";
import { LogType } from "./common/log-type";
import { IConfig } from "./config/config";
import { ToOutputChannel } from "./output-channel";
import { setStopCommand } from "./stop";
import { Synchronizer } from "./sync/syncronizer";

let synchronizer: Synchronizer | undefined;

export async function StopSyncProject() {
    if (synchronizer) {
        synchronizer.disableRemote();
        return true;
    }
    return false;
}

export async function SyncProject(context: ExtensionContext, config: IConfig, debugLog?: LogType) {
    return workspace.saveAll(false).then((ok) => {
        if (ok &&
            config) {
            if (!synchronizer) {
                synchronizer = new Synchronizer(debugLog);
                context.subscriptions.push(synchronizer);
            }
            if (synchronizer.isInProgress) {
                window.showInformationMessage("Syncronization in progress");
                return false;
            } else {
                setStopCommand(context, true);
                return synchronizer.syncronizeProject(config)
                    .then((result) => {
                        setStopCommand(context, false);
                        if (result) {
                            window.showInformationMessage(`Syncronization: ok`);
                            ToOutputChannel(`Synchronization is done.`);
                        } else {
                            window.showErrorMessage(`Syncronization: some files failed to synchronize, see output`);
                            ToOutputChannel(`Synchronization is failed.`);
                        }
                        return result;
                    }).catch((err) => {
                        if (debugLog) {
                            debugLog(err);
                        }
                        return false;
                    });
                }
        } else {
            return false;
        }
    });
}
