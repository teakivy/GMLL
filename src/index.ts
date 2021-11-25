/**
 * ---------------------------------------------------------------------------------------------
 * TYPES 
 * ---------------------------------------------------------------------------------------------
 */

import { options } from "./modules/objects/versions.js";

export type version_type = "old_alpha" | "old_beta" | "release" | "snapshot" | "fabric" | "forge" | "custom" | "unknown";
export type user_type = "msa" | "mojang" | "legacy";
export type jarTypes = "client" | "client_mappings" | "server" | "server_mappings" | "windows_server";
export type runtimes = "java-runtime-alpha" | "java-runtime-beta" | "jre-legacy" | "minecraft-java-exe";

export interface rule{
    "action": "allow" | "disallow",
    os?: {
        name?: "osx" | "windows" | "linux",
        arch?: "x86" |  "x32" | "x64" | "arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | 's390x',
        version?: string
    },
    features?: options
}
export type rules = Array<rule>;
export type launchArgs = Array<string |  {rules: rules, value?: string | string[] }>
export interface manifest {
    //The ID of the version, must be unique
    id: string,
    //version type,
    type: version_type,
    //the URL to get the version.json. Assumes version.json already exists if missing
    url?: string,
    /**Vanilla version file includes this*/
    time?: string,
    /**Vanilla version file includes this*/
    releaseTime?: string,
    /**A sha1 of the vinal version manifest file, will not redownload version.json if it matches this*/
    sha1?: string,
    /**Vanilla version file includes this*/
    complianceLevel?: 1 | 0,
    /**For version manifest files that are based on another version. */
    base?: string,
    /**From the fabric manifest files, always false for some reason */
    stable?: boolean,
    /**Overrides fields in the version json file this references. 
     *Used when pulling files from sources that have incompatibilities with the vannilla launcher methods.
     */
    overrides?: Partial<version>
}

export interface artifact {
    sha1: string,
    url: string,
    size?: number,
    id?: string,
    totalSize?: string,
    path?: string,
}
export interface assetIndex extends artifact {
    id: string
}

export interface version {
    arguments?: {
        "game": launchArgs
        "jvm": launchArgs
    },
    assetIndex: assetIndex,
    assets: string,
    downloads: {
        client: artifact,
        client_mappings?: artifact,
        server?: artifact,
        server_mappings?: artifact,
        windows_server?: artifact
    },
    logging?: {
        client: {
            argument: string,
            file: artifact,
            type: "log4j2-xml"
        }
    },
    javaVersion?: {
        component: runtimes,
        majorVersion: Number
    },
    complianceLevel: string
    id: string,
    libraries: [library],
    mainClass: string,
    minecraftArguments?: string,
    minimumLauncherVersion: Number,
    releaseTime: string,
    time: string,
    type: version_type,
    inheritsFrom?: string,
}

export interface assets {
    "objects": { [key: string]: { "hash": string, "size": number } },
    map_to_resources?: boolean,
    virtual?: boolean
}

export interface library {
    name: string,
    downloads?: {
        artifact: artifact,
        classifiers?: {
            [key: string]: artifact
        }
    },
    url?: string,
    rules?: rules,
    extract?: {
        exclude: [
            "META-INF/"
        ]
    },
    natives?: {
        linux?: string,
        windows?: string,
        osx?: string
    },
}

/**
 * ---------------------------------------------------------------------------------------------
 * INDEX 
 * ---------------------------------------------------------------------------------------------
 */

import * as _config from "./modules/config";
import { download as _download, downloadable, manifests, runtime } from "./modules/downloader";

/**
 * Does a range of required preflight checks. Will cause errors if ignored!
 */
export async function init() { await _config.initialize() }
/**The core config class */
export function getConfig() {
    return _config;
}
/**
 * Download function. Used by GMLL internally, but exposed here for downloading modpacks and launcher updates.
 * Checks sha1 hashes and can use multiple cores to download files rapidly. 
 * Untested on Intel's new CPUs, use at own risk and report to me if it breaks. -Hanro50
 * 
 * @param obj The objects that will be downloaded
 * 
 * @param it The retry factor. Will effect how long it takes before the system assumes a crash and restarts. 
 * Lower is better for small files with 1 being the minimum. Higher might cause issues if fetch decides to hang on a download. 
 * Each restart actually increments this value. 
 */
export function download(obj: Partial<downloadable>[], it: number = 1) {
    return _download(obj, it);
}