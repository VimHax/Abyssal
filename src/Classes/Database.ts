import Debug from 'debug';

const debug = Debug('abyssal:database');

interface GenericObject {
	[key: string]: any;
}

export type Data = GenericObject;
export type Query = GenericObject;
export type Options = GenericObject;

function matchQuery(query: Query, data: Data): boolean {
	const keys = Object.keys(query);
	for (const key of keys) if (data[key] !== query[key]) return false;
	return true;
}

export class Database {
	private database: Data[] = [];

	public async initialize(): Promise<void> { debug('Initialized'); }

	public async find(query: Query, options?: Options): Promise<Data[]> {
		debug('Find', query, options);
		return this.database.filter(d => matchQuery(query, d));
	}

	public async findOne(query: Query, options?: Options): Promise<Data | undefined> {
		debug('Find One', query, options);
		return this.database.find(d => matchQuery(query, d));
	}

	public async upsert(query: Query, data: Data, options?: Options): Promise<void> {
		debug('Upsert', query, data, options);
		let updated = false;
		this.database = this.database.map(d => {
			if (matchQuery(query, d)) {
				updated = true;
				return data;
			}
			return d;
		});
		if (!updated) this.database.push(data);
	}

	public async insert(data: Data, options?: Options): Promise<void> {
		debug('Insert', data, options);
		this.database.push(data);
	}

	public async delete(query: Query, options?: Options): Promise<void> {
		debug('Delete', query, options);
		this.database = this.database.filter(d => !matchQuery(query, d));
	}
}
