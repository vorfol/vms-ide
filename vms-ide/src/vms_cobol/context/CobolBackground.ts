import vscode from 'vscode';
import path from 'path';
import { TaskDivider } from '../../common/task-divider';
import { ensureSettings } from '../../synchronizer/ensure-settings';
import { ProjectFilesWatchEmitter, EFileType } from '../../synchronizer/scopeWatchers';
import { Synchronizer } from '../../synchronizer/sync/synchronizer';
import { LogFunction } from '../../common/main';
import { CobolSourceContext } from './CobolSourceContext';
import { GetCopyManager } from '../stream/CopyManagers';
import { ReadAllStream } from '../../common/read_all_stream';
import { CobolGlobals } from './CobolGlobals';

export class CobolBackground {

    public static taskDivider = new TaskDivider(true);

    public static async StartBackgroundParsing(logFn: LogFunction) {

        let processFile = (scope: string, filePath: string, fileType: EFileType) => {
            if (fileType === EFileType.header) {
                let copyManager = GetCopyManager(scope);
                if (copyManager) {
                    copyManager.clear(path.join(copyManager.getRoot(), filePath));
                }
            }
            if (fileType === EFileType.header || fileType === EFileType.source) {
                if (fileType === EFileType.source) {
                    CobolGlobals.removeGlobals(filePath);
                } else {
                    CobolGlobals.removeGlobals();
                }
                this.Refresh(logFn);
            }
        }

        // register watcher
        ProjectFilesWatchEmitter.on('changed', processFile);
        ProjectFilesWatchEmitter.on('created', processFile);
        ProjectFilesWatchEmitter.on('deleted', processFile);

        // do initial refresh
        return this.Refresh(logFn);
    }

    private static async Refresh(logFn: LogFunction) {
        let wsFolders = vscode.workspace.workspaceFolders;
        if (wsFolders) {
            for(let wsFolder of wsFolders) {
                let ensured = await ensureSettings(wsFolder.name);
                if (ensured) {
                    let localSource = await Synchronizer.acquire(logFn).requestSource(ensured, "local");
                    if (localSource) {
                        let localFiles = await localSource.findFiles(ensured.projectSection.source, ensured.projectSection.exclude);
                        if (localFiles) {
                            for (let localFile of localFiles) {
                                let fullPath = path.join(wsFolder.uri.fsPath, localFile.filename);
                                if (!CobolGlobals.getGlobals(fullPath)) {
                                    // parse and add
                                    let context = new CobolSourceContext(fullPath, logFn, GetCopyManager(wsFolder.name, wsFolder.uri.fsPath));
                                    let stream = await localSource.createReadStream(localFile.filename);
                                    if (stream) {
                                        context.setText(await ReadAllStream(stream));
                                        await context.parse();
                                        // add globals
                                        CobolGlobals.addGlobals(context);
                                    }
                                }
                            }
                        }
                    }
                }
                await this.taskDivider.testValue(); // just for pass execution to another thread
            }
        }
    }
}