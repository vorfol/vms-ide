import { LogFunction } from "../common/main";

import { IConfigApi, IConfigHelper } from "../config-helper/config/config";
import { GetConfigHelperFromApi } from "../ext-api/ext-api";
import { ProjectSection } from "./config/sections/project";
import { SynchronizeSection } from "./config/sections/synchronize";
import { ISyncScopeSettings } from "./sync/sync-api";

import * as nls from "vscode-nls";
nls.config({messageFormat: nls.MessageFormat.both});
const localize = nls.loadMessageBundle();

export interface IEnsured extends ISyncScopeSettings {
    scope?: string;
    configHelper: IConfigHelper;
}

export let configApi: IConfigApi | undefined;

export async function ensureConfigHelperApi(): Promise<boolean> {
    if (!configApi) {
        configApi = await GetConfigHelperFromApi();
    }
    return configApi !== undefined;
}

const extensionName = "vmssoftware.synchronizer";

/**
 * Returns always new IEnsured object with properly filled values.
 * @param scope name of workspaseFolder
 * @param log log
 */
export async function ensureSettings(scope?: string, log?: LogFunction): Promise<IEnsured | undefined> {
    // tslint:disable-next-line:no-empty
    const logFn = log || (() => {});
    if (!await ensureConfigHelperApi() || configApi === undefined) {
        return undefined;
    }
    const configHelper = configApi.getConfigHelper(extensionName, scope);

    if (!configHelper.workspaceFolder) {
        return undefined;
    }

    const config = configHelper.getConfig();
    // first try
    let [projectSection, synchronizeSection] =
        await Promise.all(
            [config.get(ProjectSection.section),
             config.get(SynchronizeSection.section)]);
    // test and add if missed
    const wait = [];
    if (!projectSection) {
        config.add(new ProjectSection());
        wait.push(config.get(ProjectSection.section).then((section) => {
            projectSection = section;
        }));
    }
    if (!synchronizeSection) {
        config.add(new SynchronizeSection());
        wait.push(config.get(SynchronizeSection.section).then((section) => {
            synchronizeSection = section;
        }));
    }
    // wait
    if (wait.length > 0) {
        await Promise.all(wait);
    }
    // then ensure all are loaded
    if (ProjectSection.is(projectSection) && SynchronizeSection.is(synchronizeSection)) {
        return {
            configHelper,
            projectSection,
            scope,
            synchronizeSection,
        };
    }
    return undefined;
}
