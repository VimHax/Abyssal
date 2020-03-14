
import * as Types from '../typings';
import Job from './Job';
import Trigger from './Trigger';
import Database from './Database';

class JobManager implements Types.JobManagerInterface {
	private readonly jobs: Job[] = [];

	public add(job: Job) {
		this.jobs.push(job);
	}

	public remove(id: Types.JobID) {
		const idx = this.jobs.findIndex(e => e.id === id);
		this.jobs.splice(idx, 1);
	}

	public async eventHandler(event: Types.Event, args: Types.EventArgs, triggers: Trigger[], database: Database) {
		this.jobs.forEach(job => {
			if (job.events.includes(event)) {
				job.execute(event, args, triggers, database);
			}
		});
	}
}

export default JobManager;
