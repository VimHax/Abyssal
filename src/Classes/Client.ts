
import * as Types from '../typings';
import Database from './Database';
import TriggerManager from './TriggerManager';
import JobManager from './JobManager';
import DiscordJS from 'discord.js';

class Client extends DiscordJS.Client implements Types.ClientInterface {
	public database: Database;
	public triggerManager: TriggerManager;
	public jobManager: JobManager;
	public constructor(public config: Types.ClientConfig) {
		super(config.clientOptions);
		this.database = config.database;
		this.triggerManager = config.triggerManager;
		this.jobManager = config.jobManager;
	}

	public emit(event: Types.Event, ...args: Types.EventArgs) {
		this.fireManagers(event, args);
		return super.emit(event, ...args);
	}

	private async fireManagers(event: Types.Event, args: Types.EventArgs) {
		const triggers = await this.config.triggerManager.eventHandler(event, args, this.config.database);
		this.config.jobManager.eventHandler(event, args, triggers, this.config.database);
	}

	public async login(token: string) {
		await this.config.database.initialize();
		return super.login(token);
	}
}

export default Client;
