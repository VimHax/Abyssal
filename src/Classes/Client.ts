import Debug from 'debug';
import Uniqid from 'uniqid';
import DiscordJS from 'discord.js';
import { Database } from './Database';
import { Util, Listener } from './Util';
import { Trigger, TriggerID } from './Trigger';

const debug = Debug('abyssal:client');

export type Args = any[];
export type Event = string | symbol;

export class Client extends DiscordJS.Client {
	private events: string[] = [];
	private readonly triggers: Trigger[] = [];

	public constructor(private readonly database: Database, clientOptions?: DiscordJS.ClientOptions) {
		super(clientOptions);
		this.on('ready', () => debug(`Logged in as ${this.user?.tag}`));
	}

	public addTrigger(trigger: Trigger): void {
		this.triggers.push(trigger);
		this.events = [];
		this.triggers.forEach(trigger => {
			trigger.handlers.forEach(handler => {
				handler.events.forEach(event => {
					if (!this.events.includes(event.toString())) {
						this.events.push(event.toString());
					}
				});
			});
		});
	}

	public removeTrigger(id: TriggerID): void {
		const idx = this.triggers.findIndex(e => e.id === id);
		this.triggers.splice(idx, 1);
		this.events = [];
		this.triggers.forEach(trigger => {
			trigger.handlers.forEach(handler => {
				handler.events.forEach(event => {
					if (!this.events.includes(event.toString())) {
						this.events.push(event.toString());
					}
				});
			});
		});
	}

	public emit(event: Event, ...args: Args): boolean {
		debug(`'${event.toString()}' event emitted`);
		this.eventHandler(event, args);
		return super.emit(event, ...args);
	}

	private async eventHandler(event: Event, args: Args): Promise<void> {
		debug(`Event handler method executed`);
		if (this.events.includes(event.toString())) {
			const eventList = await this.database.find({ type: 'listener' }) as Listener[];
			eventList.forEach(e => {
				const trigger = this.triggers.find(trigger => e.session.startsWith(trigger.id));
				if (trigger) {
					const handler = trigger.handlers.find(handler => handler.id === e.handler);
					if (!handler?.events.includes(event)) return;
					trigger.execHandler(e.handler, new Util({
						trigger,
						event,
						args,
						session: e.session,
						database: this.database,
						client: this
					}));
				}
			});
		}
		const utils: Util[] = this.triggers.map(trigger => new Util({
			trigger,
			event,
			args,
			session: Uniqid(`${trigger.id}-`),
			database: this.database,
			client: this
		}));
		const results = await Promise.all(this.triggers.map((trigger, i) => trigger.validate(utils[i])));
		results.forEach((condition, i) => {
			if (condition) this.triggers[i].execute(utils[i]);
		});
	}

	public async login(token: string): Promise<string> {
		debug('Initializing database...');
		await this.database.initialize();
		debug('Database initialized');
		debug('Logging in...');
		return super.login(token);
	}
}
