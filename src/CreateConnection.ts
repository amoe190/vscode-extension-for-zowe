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

import { URL } from "url";
import * as vscode from "vscode";
import * as nls from "vscode-nls";
import { IConnection } from "./connection/IConnection";
import { listProfile, updateProfile } from "./ConnectionProvider";
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export async function createNewConnection() {
    let url: URL;
    let profileName: string;
    let userName: string;
    let passWord: string;
    let zosmfURL: string;
    let rejectUnauthorize: boolean;
    let options: vscode.InputBoxOptions;

    const validateUrl = (newUrl: string) => {
        try {
            url = new URL(newUrl);
        } catch (error) {
            return false;
        }
        return url.port ? true : false;
    };

    options = {
        placeHolder: localize("createNewConnection.option.prompt.profileName.placeholder", "Connection Name"),
        prompt: localize("createNewConnection.option.prompt.profileName", "Enter a name for the connection"),
        value: profileName
    };
    profileName = await vscode.window.showInputBox(options);
    if (!profileName) {
        vscode.window.showInformationMessage(localize("createNewConnection.enterprofileName",
                "Profile Name was not supplied. Operation Cancelled"));
        return;
    }

    zosmfURL = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: localize("createNewConnection.option.prompt.url.placeholder", "http(s)://url:port"),
        prompt: localize("createNewConnection.option.prompt.url",
        "Enter a z/OSMF URL in the format 'http(s)://url:port'."),
        validateInput: (text: string) => (validateUrl(text) ? "" : "Please enter a valid URL."),
        value: zosmfURL
    });

    if (!zosmfURL) {
        vscode.window.showInformationMessage(localize("createNewConnection.enterzosmfURL",
                "No valid value for z/OSMF URL. Operation Cancelled"));
        return;
    }

    options = {
        placeHolder: localize("createNewConnection.option.prompt.userName.placeholder", "User Name (Optional)"),
        prompt: localize("createNewConnection.option.prompt.userName", "Optional: Enter the user name for the connection"),
        value: userName
    };
    userName = await vscode.window.showInputBox(options);

    options = {
        placeHolder: localize("createNewConnection.option.prompt.passWord.placeholder", "Password (Optional)"),
        prompt: localize("createNewConnection.option.prompt.userName", "Optional: Enter a password for the connection"),
        value: passWord
    };
    passWord = await vscode.window.showInputBox(options);

    const quickPickOptions: vscode.QuickPickOptions = {
        placeHolder: localize("createNewConnection.option.prompt.ru.placeholder", "Reject Unauthorized Connections"),
        ignoreFocusOut: true,
        canPickMany: false
    };

    const selectRU = [ "True - Reject connections with self-signed certificates",
                       "False - Accept connections with self-signed certificates" ];

    const ruOptions = Array.from(selectRU);

    const chosenRU = await vscode.window.showQuickPick(ruOptions, quickPickOptions);

    if (chosenRU === ruOptions[0]) {
        rejectUnauthorize = true;
    } else if (chosenRU === ruOptions[1]) {
        rejectUnauthorize = false;
    } else {
        vscode.window.showInformationMessage(localize("createNewConnection.rejectUnauthorize",
                "Operation Cancelled"));
        return;
    }

    for (const verifyProfile of listProfile()) {
        if (verifyProfile.name === profileName) {
            vscode.window.showErrorMessage(localize("createNewConnection.duplicateProfileName",
            "Profile name already exists."));
            return;
        }
    }

    const existingProfiles: IConnection[] = await listProfile();
    existingProfiles.push({
        name: profileName,
        url: zosmfURL,
        username: userName,
        password: passWord,
        reject_unauthorized: String(rejectUnauthorize),
    });

    await updateProfile (existingProfiles);
    vscode.window.showInformationMessage("Profile " + profileName + " was created.");

}
