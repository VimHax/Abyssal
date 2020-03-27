import { Util } from './Util';
import { Event } from './Client';
import { EventEmitter } from 'events';
import Debug from 'debug';

const debug = Debug('abyssal:tree');

export type TreeID = string;
export type BranchID = string;
export type BranchMethod = (util: Util) => Promise<void>;

export interface Branch {
	id: BranchID;
	method: BranchMethod;
}

export interface Tree {
	on: (event: Event, listener: (util: Util) => void) => this;
	once: (event: Event, listener: (util: Util) => void) => this;
	emit: (event: Event, util: Util) => boolean;
}

export class Tree extends EventEmitter {
	private readonly branches: Branch[] = [];

	public constructor(public id: TreeID) {
		super();
	}

	public branch(id: BranchID, method: BranchMethod) {
		this.branches.push({ id, method });
	}

	public async execBranch(id: BranchID, util: Util) {
		debug(`[ Tree: ${this.id} ] Execute Branch`, id);
		const branch = this.branches.find(branch => branch.id === id);
		if (branch) await branch.method(util);
		else throw new Error(`Branch does not exist - ${id}`);
	}
}
