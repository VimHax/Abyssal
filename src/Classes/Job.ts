
import * as Types from "../index";

class Job implements Types.JobInterface {

    public execute: Types.JobExecutor;
    constructor(
        public id: Types.JobID,
        public events: Types.Event[],
        executor: Types.JobExecutor
    ) { this.execute = executor; }

}

export default Job;