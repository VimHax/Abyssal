import { Database } from './Database';
import { Manager } from './Manager';
import DiscordJS from 'discord.js';

export class Client extends DiscordJS.Client {
	public database: Database;
	public manager: Manager;
	public constructor(public config: {
		database: Database;
		manager: Manager;
		clientOptions: DiscordJS.ClientOptions;
	}) {
		super(config.clientOptions);
		this.database = config.database;
		this.manager = config.manager;
	}

	public emit(event: string | symbol, ...args: any[]) {
		this.config.manager.eventHandler(event, args, this.config.database);
		return super.emit(event, ...args);
	}

	public async login(token: string) {
		await this.config.database.initialize();
		return super.login(token);
	}
}
