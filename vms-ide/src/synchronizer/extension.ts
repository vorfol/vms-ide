import { commands, Disposable, env, ExtensionContext, extensions, RelativePattern, window, workspace, WorkspaceFolder } from "vscode";
import * as nls from "vscode-nls";
import * as path from "path";

import micromatch from "micromatch";

import { Builder } from "./build/builder";
import { setExtensionContext } from "./context";
import { ProjectState } from "./dep-tree/proj-state";
import { ProjDepProvider } from "./dep-tree/project-dep";
import { ProjDescrProvider } from "./dep-tree/project-descr";
import { configApi, ensureConfigHelperApi, ensureSettings } from "./ensure-settings";
import { Perform } from "./performer";
import { SyncApi } from "./sync/sync-api";
import { Synchronizer } from "./sync/synchronizer";
import { LogFunction, LogType } from "../common/main";
import { collectSplittedByCommas } from "./common/find-files";
import { GetSshHelperType } from "../ext-api/ext-api";
import { SshHelper } from "../ssh-helper/ssh-helper";

const locale = env.language ;
const localize = nls.config({ locale, messageFormat: nls.MessageFormat.both })();

// tslint:disable-next-line:no-empty
let logFn: LogFunction = () => {};

let watchers: Map<string, Disposable[]> = new Map<string, Disposable[]>();

export async function activate(context: ExtensionContext) {

    if (!await ensureConfigHelperApi() || configApi === undefined) {
        return undefined;
    }

    const syncLog = configApi.createLogFunction("VMS-IDE Sync");
    const buildLog = configApi.createLogFunction("VMS-IDE Build");

    ProjectState.acquire().setLogFn(syncLog);

    logFn = syncLog;

    setExtensionContext(context);

    syncLog(LogType.debug, () => localize("debug.activated", "VMS-IDE Sync extension is activated"));

    context.subscriptions.push(Synchronizer.acquire(syncLog));
    context.subscriptions.push(Builder.acquire(buildLog));

    context.subscriptions.push( window.registerUriHandler({
        handleUri(uri) {
            syncLog(LogType.debug, () => `command: ${uri.path}`);
            syncLog(LogType.debug, () => `query: ${uri.query}`);
            syncLog(LogType.debug, () => `fragment: ${uri.fragment}`);
        }}));

    createFsWatchers();
    workspace.onDidChangeWorkspaceFolders((e) => {
        createFsWatchers();
    });

    const projectDependenciesProvider = new ProjDepProvider();
    const projectDescriptionProvider = new ProjDescrProvider();

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.syncProject", async (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return workspace.saveAll(true)
            .then((saved) => {
                if (saved) {
                    return Perform("synchronize", scope, syncLog);
                }
                return saved;
            });
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.buildProject", async (scope?: string, params?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return workspace.saveAll(true)
            .then((saved) => {
                if (saved) {
                    return Perform("build", scope, buildLog, params);
                }
                return saved;
            });
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.reBuildProject", async (scope?: string, params?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return workspace.saveAll(true)
            .then((saved) => {
                if (saved) {
                    return Perform("rebuild", scope, buildLog, params);
                }
                return saved;
            });
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.buildOnlyProject", async (scope?: string, params?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return workspace.saveAll(true)
            .then((saved) => {
                if (saved) {
                    return Perform("buildOnly", scope, buildLog, params);
                }
                return saved;
            });
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.reBuildOnlyProject", async (scope?: string, params?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return workspace.saveAll(true)
            .then((saved) => {
                if (saved) {
                    return Perform("rebuildOnly", scope, buildLog, params);
                }
                return saved;
            });
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.cleanProject", async (scope?: string, buildType?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("clean", scope, buildLog, buildType);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.createMMS", async (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("create mms", scope, buildLog);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.stopSync", async () => {
        return Synchronizer.acquire().disableRemote();
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.editProject", async (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("edit settings", scope, syncLog);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.ssh-helper.editSettings", (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("edit ssh settings", scope, syncLog);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.changeCRLF", async (scope?: string) => {
        return Perform("crlf", scope, syncLog);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.forceSynchronized", async (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return ProjectState.acquire().setSynchronized(scope, true);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.forceBuilt", async (scope?: string, buildType?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return ProjectState.acquire().setBuilt(scope, buildType, true);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.uploadZip", async (scope?: string, clear?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("zip", scope, syncLog, clear);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.upload", async (scope?: string) => {
        scope = scope || projectDependenciesProvider.selectedProject();
        return Perform("upload", scope, syncLog);
    }));

    context.subscriptions.push( commands.registerCommand("vmssoftware.synchronizer.downloadHeaders", async (scope?: string, params?: string) => {
        return Perform("headers", scope, syncLog, params);
    }));

    context.subscriptions.push( window.registerTreeDataProvider("vmssoftware.project-dep.projectDependencies", projectDependenciesProvider) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.select",
        (element) => projectDependenciesProvider.select(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.add",
        (element) => projectDependenciesProvider.add(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.build",
        (element) => projectDependenciesProvider.build(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.rebuild",
        (element) => projectDependenciesProvider.rebuild(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.buildOnly",
        (element) => projectDependenciesProvider.buildOnly(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.rebuildOnly",
        (element) => projectDependenciesProvider.rebuildOnly(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.clean",
        (element) => projectDependenciesProvider.clean(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.remove",
        (element) => projectDependenciesProvider.remove(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDependencies.refresh",
        () => projectDependenciesProvider.refresh()) );

    context.subscriptions.push( window.registerTreeDataProvider("vmssoftware.project-dep.projectDescription", projectDescriptionProvider) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDescription.select",
        (projectName) => projectDescriptionProvider.select(projectName)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDescription.refresh",
        () => projectDescriptionProvider.refresh()) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDescription.edit",
        (element) => projectDescriptionProvider.edit(element)) );
    context.subscriptions.push( commands.registerCommand("vmssoftware.project-dep.projectDescription.changeBuildType",
        () => projectDescriptionProvider.changeBuildType()) );

    return new SyncApi();
}

// this method is called when your extension is deactivated
export function deactivate() {
    for (const [scope, scopeWatchers] of  watchers) {
        scopeWatchers.forEach(w => w.dispose());
    }
    watchers.clear();
    logFn(LogType.debug, () => localize("debug.deactivated", "VMS-IDE Sync extension is deactivated"));
}

async function createFsWatchers() {
    for (const [scope, scopeWatchers] of  watchers) {
        scopeWatchers.forEach(w => w.dispose());
    }
    watchers.clear();
    if (workspace.workspaceFolders) {
        const SshHelperType = GetSshHelperType();
        if (!SshHelperType) {
            return;
        }
        let sshHelper = new SshHelperType();
        for (const folder of workspace.workspaceFolders) {
            createScopeFsWatchers(folder, sshHelper);
        }
    }
}

async function createScopeFsWatchers(folder: WorkspaceFolder, sshHelper: SshHelper) {
    const scopeWatchers: Disposable[] = [];
    const ensured = await ensureSettings(folder.name, logFn);
    if (ensured) {
        // 1. Setup source file watcher 
        // prepare micromatch
        const includes = [
            ensured.projectSection.source,
            ensured.projectSection.resource,
            ensured.projectSection.headers,
            ensured.projectSection.builders,
        ];
        const include = includes.join(",");
        const options: micromatch.Options = {
            basename: true,
            nocase: true,
            nodupes: true,
            unixify: false,
        };
        const unbracedInclude = micromatch.braces(include);
        const splittedInclude = unbracedInclude.reduce(collectSplittedByCommas, []);
        if (ensured.projectSection.exclude) {
            const unbraceExclude = micromatch.braces(ensured.projectSection.exclude);
            const splitExclude = unbraceExclude.reduce(collectSplittedByCommas, []);
            options.ignore = splitExclude;
        }

        const relativePattern = new RelativePattern(folder, "**/*.*");
        const fsWatcher = workspace.createFileSystemWatcher(relativePattern, false, false, false);
        const rootLength = folder.uri.fsPath.length + 1;
        fsWatcher.onDidCreate((uri) => {
            testModifySync(folder.name, uri.fsPath.slice(rootLength), splittedInclude, options);
        });
        fsWatcher.onDidDelete((uri) => {
            testModifySync(folder.name, uri.fsPath.slice(rootLength), splittedInclude, options);
        });
        fsWatcher.onDidChange((uri) => {
            testModifySync(folder.name, uri.fsPath.slice(rootLength), splittedInclude, options);
        });
        scopeWatchers.push(fsWatcher);

        // 2. Setup SSH settings watcher 
        if (sshHelper) {
            scopeWatchers.push(sshHelper.setConfigWatcher(folder.name, () => {
                commands.executeCommand("vmssoftware.project-dep.projectDescription.refresh");
                ProjectState.acquire().setSynchronized(folder.name, false);
            }));
        }

        // 3. Setup Project settings watcher 
        scopeWatchers.push(ensured.configHelper.getConfig().onDidLoad(() => {
            ProjectState.acquire().setSynchronized(folder.name, false);
            // recreate watchers for this folder
            createScopeFsWatchers(folder, sshHelper);
        }));
    }
    const prevWatchers = watchers.get(folder.name);
    if (prevWatchers) {
        prevWatchers.forEach(w => w.dispose());
    }
    watchers.set(folder.name, scopeWatchers);
}

function testModifySync(scope: string, filePath: string, includes: string[], options: micromatch.Options) {
    const list = micromatch([filePath], includes, options);
    if (list.length) {
        ProjectState.acquire().addModified(scope, filePath);
    }
}
