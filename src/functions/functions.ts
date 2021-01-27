import * as settings from "electron-settings";

export default class Functions {
    static async getSetting(name: string) {
        return (await settings.get(name)) ?? await settings.get(["default", name]);
    }

    static async setDefault(args: string[]) {
        await settings.set({ "prod": args.includes("--debug") ? false : true });
        await settings.set("default", {
            "showGif": true,
            "timeout": "10 sec",
            "interval": "20 min",
            "times": [
                "9:00",
                "16:00"
            ]
        });
        console.log(await settings.get("default"));
    }
}
