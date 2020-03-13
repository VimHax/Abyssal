
import * as Types from "../index";
import DiscordJS from "discord.js";

class Client extends DiscordJS.Client implements Types.ClientInterface {

    constructor(public config: Types.ClientConfig) {
        super(config.clientOptions);
    }

    emit(event: string | symbol, ...args: any[]) {
        this.fireManagers(event, args);
        return super.emit(event, ...args);
    }

    private async fireManagers(event: string | symbol, args: any[]) {
        const commands = await this.config.commandManager.eventHandler(event, args, this.config.database);
        this.config.taskManager.eventHandler(event, args, commands, this.config.database)
    }

    async login(token: string) {
        await this.config.database.initialize();
        return super.login(token);
    }

}

export default Client;