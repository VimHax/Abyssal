import { Util } from './Util';
import { EventEmitter } from 'events';

export type TreeID = string;
export type BranchID = string;
export type BranchMethod = (util: Util) => Promise<void>;

export interface Branch {
	id: BranchID;
	method: BranchMethod;
}

export interface Tree {
	on: (event: string | symbol, listener: (util: Util) => void) => this;
	once: (event: string | symbol, listener: (util: Util) => void) => this;
	emit: (event: string | symbol, util: Util) => boolean;
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
		const branch = this.branches.find(branch => branch.id === id);
		if (branch) await branch.method(util);
	}
}
