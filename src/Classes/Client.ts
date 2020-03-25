import { Database } from './Database';
import { Manager } from './Manager';
import DiscordJS from 'discord.js';
import Debug from 'debug';

const debug = Debug('abyssal:client');

export class Client extends DiscordJS.Client {
	public database: Database;
	public manager: Manager;
	public constructor(config: {
		database: Database;
		manager: Manager;
		clientOptions?: DiscordJS.ClientOptions;
	}) {
		super(config.clientOptions);
		this.database = config.database;
		this.manager = config.manager;
		this.on('ready', () => debug(`Logged in as ${this.user?.tag}`));
	}

	public emit(event: string | symbol, ...args: any[]) {
		debug(`'${event.toString()}' event emitted`);
		this.manager.eventHandler({
			event,
			args,
			database: this.database,
			client: this
		});
		return super.emit(event, ...args);
	}

	public async login(token: string) {
		debug('Initializing database...');
		await this.database.initialize();
		debug('Database initialized');
		debug('Logging in...');
		return super.login(token);
	}
}
