import Debug from 'debug';

const debug = Debug('abyssal:database');

export interface Document { [key: string]: any }
export interface Query { [key: string]: any }
export interface Options { [key: string]: any }
export interface FindOptions extends Options { single?: boolean }
export interface UpdateOptions extends Options { upsert?: boolean }

function matchQuery(query: Query, document: Document): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (document[key] !== query[key]) return false;
	return true;
}

export class Database {
	private database: Document[] = [];

	public async initialize() { debug('Initialized'); }

	public async find(query: Query, options?: FindOptions) {
		debug('Find', query, options);
		if (options?.single) return this.database.find(doc => matchQuery(query, doc));
		return this.database.filter(doc => matchQuery(query, doc));
	}

	public async update(query: Query, document: Document, options?: UpdateOptions) {
		debug('Update', query, document, options);
		let updated = false;
		this.database = this.database.map(doc => {
			if (matchQuery(query, doc)) {
				updated = true;
				return document;
			}
			return doc;
		});
		if (!updated && options?.upsert) this.database.push(document);
	}

	public async insert(document: Document, options?: Options) {
		debug('Insert', document, options);
		this.database.push(document);
	}

	public async delete(query: Query, options?: Options) {
		debug('Delete', query, options);
		this.database = this.database.filter(doc => !matchQuery(query, doc));
	}
}
