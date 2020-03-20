export interface State {
	type: 'state';
	session: string;
	[key: string]: any;
}

export interface Listener {
	type: 'listener';
	event: string;
	session: string;
	branch: string;
}

import { Database, Query, Document } from './Database';

function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) {
		if (document[key] !== query[key]) return false;
	}
	return true;
}

export class Util {
	public treeID: string;
	public branchID: string | false;
	public event: string | symbol;
	public args: any[];
	public session: string;
	public state: State;
	public listeners: Listener[] = [];
	public database: Database;
	private readonly execBranchMethod: (branchID: string, util: Util) => Promise<void>;

	public constructor(config: {
		treeID: string;
		branchID: string | false;
		event: symbol | string;
		args: any[];
		session: string;
		database: Database;
		execBranch: (branchID: string, util: Util) => Promise<void>;
	}, private readonly debug?: boolean) {
		this.treeID = config.treeID;
		this.branchID = config.branchID;
		this.event = config.event;
		this.args = config.args;
		this.session = config.session;
		this.database = config.database;
		this.execBranchMethod = config.execBranch;
		this.state = {
			type: 'state',
			session: config.session
		};
	}

	public execBranch(branchID: string) {
		this.debug && console.log(`Util --> Execute Branch [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		return this.execBranchMethod(branchID, this);
	}

	public getStateProperty(property: string) {
		this.debug && console.log(`Util --> Get State Property [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		return this.state[property];
	}

	public setStateProperty(property: string, value: any) {
		this.debug && console.log(`Util --> Set State Property [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		this.state[property] = value;
	}

	public deleteStateProperty(property: string) {
		this.debug && console.log(`Util --> Delete State Property [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		delete this.state[property];
	}

	public async loadState() {
		this.debug && console.log(`Util --> Load State [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		this.state = (await this.database.findOne({
			type: 'state',
			session: this.session
		})) as State || {
			type: 'state',
			session: this.session
		};
	}

	public saveState() {
		this.debug && console.log(`Util --> Save State [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		return this.database.update({
			type: 'state',
			session: this.session
		}, this.state);
	}

	public deleteState() {
		this.debug && console.log(`Util --> Delete State [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		return this.database.delete({
			type: 'state',
			session: this.session
		});
	}

	public async loadListeners() {
		this.debug && console.log(`Util --> Loade Listeners [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		this.listeners = (await this.database.find({
			type: 'listener',
			session: this.session
		})) as Listener[];
	}

	public async addListener(event: string | symbol, branchID: string) {
		this.debug && console.log(`Util --> Add Listeners [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		const listener: Listener = {
			type: 'listener',
			event: event.toString(),
			session: this.session,
			branch: branchID
		};
		this.listeners.push(listener);
		return this.database.insert(listener);
	}

	public async removeListeners(event: (string | symbol) | true, branchID: string | true) {
		this.debug && console.log(`Util --> Remove Listeners [ Tree: ${this.treeID}, Branch: ${this.branchID}, Session: ${this.session} ]`);
		const query: Query = {};
		if (event !== true) query.event = event.toString();
		if (branchID !== true) query.branch = branchID;
		this.listeners = this.listeners.filter(listener => !matchQuery(query, listener));
		query.type = 'listener';
		query.session = this.session;
		return this.database.delete(query);
	}
}
