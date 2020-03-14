
import * as Types from '../typings';

class Job implements Types.JobInterface {
	public execute: Types.JobExecutor;
	public constructor(
		public id: Types.JobID,
		public events: Types.Event[],
		executor: Types.JobExecutor
	) { this.execute = executor; }
}

export default Job;
