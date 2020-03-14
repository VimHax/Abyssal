
import * as Types from "../index";
import DiscordJS from "discord.js";

class Client extends DiscordJS.Client implements Types.ClientInterface {

    public database: Types.Database;
    public triggerManager: Types.TriggerManager;
    public jobManager: Types.JobManager;
    constructor(public config: Types.ClientConfig) {
        super(config.clientOptions);
        this.database = config.database;
        this.triggerManager = config.triggerManager;
        this.jobManager = config.jobManager;
    }

    emit(event: Types.Event, ...args: Types.EventArgs) {
        this.fireManagers(event, args);
        return super.emit(event, ...args);
    }

    private async fireManagers(event: Types.Event, args: Types.EventArgs) {
        const triggers = await this.config.triggerManager.eventHandler(event, args, this.config.database);
        this.config.jobManager.eventHandler(event, args, triggers, this.config.database)
    }

    async login(token: string) {
        await this.config.database.initialize();
        return super.login(token);
    }

}

export default Client;