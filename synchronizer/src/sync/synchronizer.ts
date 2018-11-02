import path from "path";
import vscode from "vscode";

import { GetSshHelperFromApi } from "../config/get-ssh-helper";
import { KindOfFiles, ProjectSection } from "../config/sections/project";
import { DownloadAction, SynchronizeSection } from "../config/sections/synchronize";
import { IConfig, IConfigSection } from "../ext-api/config";

import { Delay } from "@vorfol/common";
import { LogType } from "@vorfol/common";
import { ftpPathSeparator } from "@vorfol/common";
import { IFileEntry } from "@vorfol/common";

import { ISftpClient } from "../ext-api/api";
import { ISshShell } from "../ext-api/api";
import { SshHelper } from "../ext-api/ssh-helper";

import { EnsureSettings, synchronizerConfig } from "../ensure-settings";
import { ToOutputChannel } from "../output-channel";
import { FsSource } from "./fs-source";
import { ISource } from "./source";
import { VmsSource } from "./vms-source";

import * as nls from "vscode-nls";
nls.config({messageFormat: nls.MessageFormat.both});
const localize = nls.loadMessageBundle();

export async function createFile(fileUri: vscode.Uri, content: string) {
    try {
        let range: vscode.Range | undefined;
        try {
            const textDoc = await vscode.workspace.openTextDocument(fileUri);
            range = textDoc.validateRange(new vscode.Range(0, 0, 32767, 32767));
        } catch (err) {
            range = undefined;
        }
        const we = new vscode.WorkspaceEdit();
        if (!range) {
            we.createFile(fileUri);
            we.insert(fileUri, new vscode.Position(0, 0), content);
        } else {
            we.replace(fileUri, range, content);
        }
        const status = await vscode.workspace.applyEdit(we);
        if (status) {
            const textDoc = await vscode.workspace.openTextDocument(fileUri);
            const saved = await textDoc.save();
            return saved;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

export class Synchronizer {

    public get isInProgress(): boolean {
        return this.inProgress;
    }

    private inProgress = false;
    private remoteSftp?: ISftpClient;
    private remoteShell?: ISshShell;
    private remoteSource?: ISource;
    private localSource?: ISource;
    private include?: string;
    private exclude?: string;
    private projectSection?: IConfigSection;
    private synchronizeSection?: IConfigSection;
    private downloadNewFiles: DownloadAction = "edit";
    private onDidLoadConfig?: vscode.Disposable;  // dispose listener
    private onDidLoadSSHConfig?: vscode.Disposable;  // dispose listener
    private sshHelper?: SshHelper;

    private outSync = localize("output.sync_in_progress", "Synchronization is in progress");
    private outNoWs = localize("output.no_workspace", "There is no workspace to synchronize");
    private outEditSett = localize("output.edit_settings", "In first please edit settings");

    constructor(public debugLog?: LogType) {
    }

    public get lastErrors() {
        const errors: Error[] = [];
        if (this.remoteShell) {
            if (this.remoteShell.lastShellError) {
                errors.push(this.remoteShell.lastShellError);
            }
            if (this.remoteShell.lastClientError) {
                errors.push(this.remoteShell.lastClientError);
            }
        }
        if (this.remoteSftp) {
            if (this.remoteSftp.lastSftpError) {
                errors.push(this.remoteSftp.lastSftpError);
            }
            if (this.remoteSftp.lastClientError) {
                errors.push(this.remoteSftp.lastClientError);
            }
        }
        return errors;
    }

    public compareLists(localList: IFileEntry[], remoteList: IFileEntry[]) {
        const upload: IFileEntry[] = [];    // from local to remote
        const download: IFileEntry[] = [];  // from remote to local
        const remoteLeft = remoteList.slice(0);
        for (const localFile of localList) {
            const remoteFileIdx = remoteLeft.findIndex((tstRemoteFile) => {
                return tstRemoteFile.filename.toUpperCase() === localFile.filename.toLocaleUpperCase();
            });
            if (remoteFileIdx === -1) {
                if (this.debugLog) {
                    this.debugLog(localize("debug.no_remote", "No remote {0} => upload", localFile.filename));
                }
                upload.push(localFile);
            } else {
                const diff = (remoteLeft[remoteFileIdx].date.valueOf() - localFile.date.valueOf()) / 1000;
                if (diff < -1) {
                    if (this.debugLog) {
                        this.debugLog(localize("debug.local_is_newer", "Local {0} is newer by {diff} => upload", localFile.filename));
                    }
                    upload.push(localFile);
                } else if (diff > 1) {
                    if (this.debugLog) {
                        this.debugLog(localize("debug.remote_is_newer", "Remote {0} is newer by {1} => download", localFile.filename, diff));
                    }
                    download.push(remoteLeft[remoteFileIdx]);
                } else if (this.debugLog) {
                    this.debugLog(localize("debug.the_same", "{0} are the same", localFile.filename));
                }
                remoteLeft.splice(remoteFileIdx, 1);
            }
        }
        if (this.debugLog) {
            for (const file of remoteLeft) {
                this.debugLog(localize("debug.no_local", "No local {0} => download", file.filename));
            }
        }
        download.push(...remoteLeft);
        return { upload, download };
    }

    public enableRemote() {
        if (this.remoteSftp) {
            this.remoteSftp.enabled = true;
        }
        if (this.remoteShell) {
            this.remoteShell.enabled = true;
        }
    }

    public disableRemote() {
        if (this.debugLog) {
            this.debugLog(localize("debug.dissblig", "Disabling SFTP and SHELL"));
        }
        if (this.remoteSftp) {
            this.remoteSftp.enabled = false;
        }
        if (this.remoteShell) {
            this.remoteShell.enabled = false;
        }
    }

    public async syncronizeProject() {
        if (this.inProgress) {
            ToOutputChannel(this.outSync);
            return false;
        }
        if (!vscode.workspace.workspaceFolders ||
            vscode.workspace.workspaceFolders.length < 1) {
            ToOutputChannel(this.outNoWs);
            return false;
        }
        this.inProgress = true;
        let retCode = await this.prepare();
        if (retCode &&
            this.localSource &&
            this.remoteSource &&
            this.include &&
            this.sshHelper) {
            // clear password cache
            this.sshHelper.clearPasswordCashe();
            // get lists
            this.enableRemote();
            const [remoteList,
                   localList] = await Promise.all([this.remoteSource.findFiles(this.include, this.exclude),
                                                   this.localSource.findFiles(this.include, this.exclude)]);
            // compare them
            const compareResult = this.compareLists(localList, remoteList);
            const waitAll = [];
            // upload
            for (const uploadFile of compareResult.upload) {
                waitAll.push(
                    this.transferFile(this.localSource, this.remoteSource, uploadFile.filename, uploadFile.date)
                        .then((ok) => {
                            if (ok) {
                                ToOutputChannel(localize("output.uploaded", "{0} is uploaded", uploadFile.filename));
                            } else {
                                ToOutputChannel(localize("output.upload_failed", "{0} is failed to upload", uploadFile.filename));
                            }
                            return ok;
                        }).catch(() => false));
            }
            // download
            if (this.downloadNewFiles === "overwrite") {
                for (const downloadFile of compareResult.download) {
                    waitAll.push(
                        this.transferFile(this.remoteSource, this.localSource, downloadFile.filename, downloadFile.date)
                            .then((ok) => {
                                if (ok) {
                                    ToOutputChannel(localize("output.downloaded", "{0} is downloaded", downloadFile.filename));
                                } else {
                                    ToOutputChannel(localize("output.download_failed", "{0} is failed to download", downloadFile.filename));
                                }
                                return ok;
                            }).catch(() => false));
                }
            } else if (this.downloadNewFiles === "skip") {
                for (const downloadFile of compareResult.download) {
                    ToOutputChannel(localize("output.download_manually", "Remote {0} is newer, please check and download it manually", downloadFile.filename));
                }
            } else if (this.downloadNewFiles === "edit") {
                for (const downloadFile of compareResult.download) {
                    waitAll.push(this.editFile(this.remoteSource, downloadFile.filename));
                }
                if (compareResult.download.length > 0) {
                    ToOutputChannel(localize("output.edit_count", "Please edit and save {0} files manually", compareResult.download.length));
                }
            }
            // wait all operations are done
            const results = await Promise.all(waitAll);
            // end
            this.decideIfDispose();
            retCode = results.reduce((acc, result) => {
                acc = acc && result;
                return acc;
            }, true);
            if (this.debugLog) {
                this.debugLog(localize("debug.retcode", "Synchronize retCode: {0}", retCode));
            }
        } else {
            ToOutputChannel(this.outEditSett);
        }
        this.inProgress = false;
        return retCode;
    }

    public decideIfDispose() {
        if (!SynchronizeSection.is(this.synchronizeSection) ||
            this.synchronizeSection.keepAlive) {
            // test configuration watcher and create if need
            if (this.onDidLoadConfig === undefined &&
                synchronizerConfig) {
                this.onDidLoadConfig = synchronizerConfig.onDidLoad(() => this.prepare());
            }
            if (this.onDidLoadSSHConfig === undefined &&
                this.sshHelper &&
                this.sshHelper.onDidLoadConfig !== undefined) {
                this.onDidLoadSSHConfig = this.sshHelper.onDidLoadConfig(() => {
                    this.dispose();
                });
            }
        } else {
            this.dispose();
        }
    }

    public async downloadListings() {
        if (this.inProgress) {
            ToOutputChannel(this.outSync);
            return false;
        }
        if (!vscode.workspace.workspaceFolders ||
            vscode.workspace.workspaceFolders.length < 1) {
            ToOutputChannel(this.outNoWs);
            return false;
        }
        this.inProgress = true;
        let retCode = await this.prepare(KindOfFiles.listing);
        if (retCode &&
            this.localSource &&
            this.remoteSource &&
            this.include &&
            this.sshHelper) {
            // do not exclude anything
            const remoteList = await this.remoteSource.findFiles(this.include);
            // download
            const waitAll = [];
            for (const downloadFile of remoteList) {
                waitAll.push(
                    this.transferFile(this.remoteSource, this.localSource, downloadFile.filename, downloadFile.date)
                        .then((ok) => {
                            if (ok) {
                                ToOutputChannel(localize("output.downloaded.list", "{0} is downloaded", downloadFile.filename));
                            } else {
                                ToOutputChannel(localize("output.download_failed.list", "{0} is failed to download", downloadFile.filename));
                            }
                            return ok;
                        }).catch(() => false));
            }
            // wait all operations are done
            const results = await Promise.all(waitAll);
            // end
            this.decideIfDispose();
            retCode = results.reduce((acc, result) => {
                acc = acc && result;
                return acc;
            }, true);
            if (this.debugLog) {
                this.debugLog(localize("debug.retcode_list", "Download listing retCode: {0}", retCode));
            }
        } else {
            ToOutputChannel(this.outEditSett);
        }
        this.inProgress = false;
        return retCode;
    }

    public dispose() {
        if (this.debugLog) {
            this.debugLog(localize("debug.disposing", "Disposing sources"));
        }
        if (this.remoteSftp) {
            this.remoteSftp.dispose();
        }
        if (this.remoteShell) {
            this.remoteShell.dispose();
        }
        this.remoteSource = undefined;
        this.localSource = undefined;
    }

    /**
     * Check whether the saved variables are suitable for the current configuration.
     * If not - dispose them and create another ones.
     * Note: no real connections are creating in constructors
     * @param config config
     */
    private async prepare(kind?: KindOfFiles) {
        // get current config
        if (!await EnsureSettings() || !synchronizerConfig) {
            return false;
        }
        if (!this.sshHelper) {
            const sshHelperType = await GetSshHelperFromApi();
            if (!sshHelperType) {
                if (this.debugLog) {
                    this.debugLog(localize("debug.cannot_get_ssh_helper", "Cannot get ssh-helper api"));
                }
                ToOutputChannel(localize("output.install_ssh", "Please, install 'vmssoftware.ssh-helper' first"));
                return false;
            }
            this.sshHelper = new sshHelperType(this.debugLog);
        }
        const [projectSection,
               synchronizeSection] = await Promise.all(
                   [synchronizerConfig.get(ProjectSection.section),
                    synchronizerConfig.get(SynchronizeSection.section)]);
        // test if the user won't keep them alive
        let recreateRemote = false;
        if (SynchronizeSection.is(synchronizeSection)) {
            if (!synchronizeSection.keepAlive) {
                recreateRemote = true;
                // test configuration watchers and delete if exist
                if (this.onDidLoadConfig) {
                    this.onDidLoadConfig.dispose();
                    this.onDidLoadConfig = undefined;
                }
                if (this.onDidLoadSSHConfig) {
                    this.onDidLoadSSHConfig.dispose();
                    this.onDidLoadSSHConfig = undefined;
                }
            }
        }
        if (recreateRemote) {
            this.dispose();
        }
        // store current values
        this.projectSection = projectSection;
        this.synchronizeSection = synchronizeSection;
        // check if all are ready to create variables
        if (ProjectSection.is(this.projectSection) &&
            SynchronizeSection.is(this.synchronizeSection) &&
            vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders.length > 0) {
            // reparse includes
            const includes: string[] = [];
            if (kind) {
                // tslint:disable-next-line:no-bitwise
                if (kind & KindOfFiles.source) {
                    includes.push(this.projectSection.source);
                }
                // tslint:disable-next-line:no-bitwise
                if (kind & KindOfFiles.resource) {
                    includes.push(this.projectSection.resource);
                }
                // tslint:disable-next-line:no-bitwise
                if (kind & KindOfFiles.listing) {
                    includes.push(this.projectSection.listing);
                }
                // tslint:disable-next-line:no-bitwise
                if (kind & KindOfFiles.headers) {
                    includes.push(this.projectSection.headers);
                }
                // tslint:disable-next-line:no-bitwise
                if (kind & KindOfFiles.builders) {
                    includes.push(this.projectSection.builders);
                }
            } else {
                includes.push(this.projectSection.source);
                includes.push(this.projectSection.resource);
                includes.push(this.projectSection.listing);
                includes.push(this.projectSection.headers);
                includes.push(this.projectSection.builders);
            }
            this.include = includes.join(",");
            this.downloadNewFiles = this.synchronizeSection.downloadNewFiles;
            this.exclude = this.projectSection.exclude;
            if (!this.remoteSource) {
                if (this.debugLog) {
                    this.debugLog(localize("debug.create_remote", "Creating remote source"));
                }
                const [sftp, shell] = await Promise.all([
                        this.sshHelper.getDefaultSftp(),
                        this.sshHelper.getDefaultVmsShell(),
                    ]);
                if (sftp && shell) {
                    this.remoteSftp = sftp;
                    this.remoteShell = shell;
                    this.remoteSource = new VmsSource(sftp, shell, this.projectSection.root, this.debugLog, this.synchronizeSection.setTimeAttempts);
                }
            } else {
                if (this.debugLog) {
                    this.debugLog(localize("debug.update_remote", "Update remote source"));
                }
                this.remoteSource.root = this.projectSection.root;
                this.remoteSource.attempts = this.synchronizeSection.setTimeAttempts;
            }
            if (!this.localSource) {
                if (this.debugLog) {
                    this.debugLog(localize("debug.create_local", "Creating local source"));
                }
                this.localSource = new FsSource(vscode.workspace.workspaceFolders[0].uri.fsPath, this.debugLog);
            } else {
                if (this.debugLog) {
                    this.debugLog(localize("debug.update_local", "Update local source"));
                }
                this.localSource.root = vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
            return true;
        }
        return false;
    }

    private async transferFile(from: ISource, to: ISource, file: string, date: Date) {
        const dirEnd = file.lastIndexOf(ftpPathSeparator);
        if (dirEnd !== -1) {
            const dir = file.slice(0, dirEnd);
            await to.ensureDirectory(dir);
        }
        return this.sshHelper!.pipeFile(from, to, file, file, this.debugLog)
            .then(async (ok) => {
                if (ok) {
                    // TODO: test anyhow that file is completely written before setting date
                    await Delay(500);
                    return to.setDate(file, date);
                }
                return false;
            }).catch((err) => {
                if (this.debugLog) {
                    this.debugLog(err);
                }
                return false;
            });
    }

    private async editFile(source: ISource, file: string) {
        const memoryStream = this.sshHelper!.memStream();
        let content: string | undefined;
        let localUri: vscode.Uri | undefined;
        return this.sshHelper!.pipeFile(source, memoryStream, file, "", this.debugLog)
            .then(async (ok) => {
                if (ok && memoryStream.writeStream && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    content = Buffer.concat(memoryStream.writeStream.chunks).toString("utf8");
                    const workspaceUri = vscode.workspace.workspaceFolders[0].uri;
                    localUri = vscode.Uri.file(path.join(workspaceUri.fsPath, file));
                    return vscode.workspace.openTextDocument(localUri)
                        .then(async (localDoc) => {
                            return [localDoc, await vscode.workspace.openTextDocument({content, language: "mms"})];
                        }).then(([localDoc, remoteDoc]) => {
                            const title = localize("title.rem_loc", "Remote {0} <-> Local", file);
                            return vscode.commands.executeCommand("vscode.diff", remoteDoc.uri, localDoc.uri, title, { preview: false });
                        }).then(() => true);
                } else {
                    return false;
                }
            }).catch((errPipeOrAfter) => {
                if (this.debugLog) {
                    this.debugLog(errPipeOrAfter);
                }
                if (localUri && content) {
                    return createFile(localUri, content)
                        .then((ok) => {
                            if (ok) {
                                return vscode.window.showTextDocument(localUri!, { preview: false })
                                    .then(() => true);
                            } else {
                                return false;
                            }
                        }).catch((errCreateOrShow) => {
                            if (this.debugLog) {
                                this.debugLog(errCreateOrShow);
                            }
                            return false;
                        });
                } else {
                    if (this.debugLog) {
                        this.debugLog(localize("debug.nothing", "Nothing to show"));
                    }
                    return false;
                }
            }).catch((errLast) => {
                if (this.debugLog) {
                    this.debugLog(errLast);
                }
                return false;
            });
    }
}
