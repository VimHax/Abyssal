import { Util, Listener } from './Util';
import { Database } from './Database';
import { Tree, TreeID } from './Tree';
import uniqid from 'uniqid';

export class Manager {
	private readonly trees: Tree[] = [];

	// eslint-disable-next-line no-useless-constructor
	public constructor(private readonly debugUtil?: boolean) { }

	public addTree(tree: Tree) {
		this.trees.push(tree);
	}

	public removeTree(id: TreeID) {
		const idx = this.trees.findIndex(e => e.id === id);
		this.trees.splice(idx, 1);
	}

	public async eventHandler(event: string | symbol, args: any[], database: Database) {
		const eventList = await database.find({
			type: 'listener',
			event: event.toString()
		}) as Listener[];
		eventList.forEach(e => {
			const tree = this.trees.find(trig => e.session.startsWith(trig.id));
			tree?.execBranch(e.branch, new Util({
				treeID: tree.id,
				branchID: e.branch,
				event,
				args,
				session: e.session,
				database,
				execBranch: tree.execBranch
			}, this.debugUtil));
		});
		const sessions: string[] = this.trees.map(tree => uniqid(`${tree.id}-`));
		this.trees.forEach((tree, i) => tree.emit(event, new Util({
			treeID: tree.id,
			branchID: false,
			event,
			args,
			session: sessions[i],
			database,
			execBranch: tree.execBranch
		}, this.debugUtil)));
	}
}
