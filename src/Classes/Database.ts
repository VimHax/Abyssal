import Debug from 'debug';

const debug = Debug('abyssal:database');

export interface Document {
	[key: string]: any;
}

export interface Query {
	[key: string]: any;
}

function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (document[key] !== query[key]) return false;
	return true;
}

export class Database {
	private database: Document[] = [];

	public async initialize() { debug('Initialized...'); }

	public async find(query: Query) {
		debug('Find', query);
		return this.database.filter(doc => matchQuery(query, doc));
	}

	public async findOne(query: Query) {
		debug('Find One', query);
		return this.database.find(doc => matchQuery(query, doc));
	}

	public async update(query: Query, document: Document) {
		debug('Update', query, document);
		let updated = false;
		this.database = this.database.map(doc => (matchQuery(query, doc) && ((updated = true) && document)) || doc);
		if (!updated) this.database.push(document);
	}

	public async insert(document: Document) {
		debug('Insert', document);
		this.database.push(document);
	}

	public async delete(query: Query) {
		debug('Delete', query);
		this.database = this.database.filter(doc => !matchQuery(query, doc));
	}
}
