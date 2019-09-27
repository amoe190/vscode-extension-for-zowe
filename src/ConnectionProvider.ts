/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import * as vscode from "vscode";
import { IConnection } from "./connection/IConnection";

export const ProfileConfigID: string = "Zowe-Zosmf-Profiles";
export const password = {};

export function listProfile() {

    const ProfileConfigHost = vscode.workspace.getConfiguration().inspect(ProfileConfigID);
    let ProfileConfigList: IConnection[] = [];

    if (ProfileConfigHost && ProfileConfigHost.globalValue) {
        ProfileConfigList = ProfileConfigHost.globalValue as IConnection[];
    }

    ProfileConfigList.forEach((host) => {
        if (this.password [host.name]) {
            host.password = this.password[host.name];
        }
    });
    return ProfileConfigList;
}

export function updateProfile(newProfile: IConnection[]) {

    const cleanProfiles: IConnection[] = [];

    newProfile.forEach((host) => {
        const RevisedProfiles = {...host};
        delete RevisedProfiles.password;
        cleanProfiles.push(RevisedProfiles);
    });

    return vscode.workspace
        .getConfiguration()
        .update(ProfileConfigID, cleanProfiles, vscode.ConfigurationTarget.Global);
}
