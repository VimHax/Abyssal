
import * as Types from "../index";

class JobManager implements Types.JobManagerInterface {

    private jobs: Types.Job[] = [];

    add(job: Types.Job) {
        this.jobs.push(job);
    }

    remove(id: Types.JobID) {
        const idx = this.jobs.findIndex(e => e.id == id);
        this.jobs.splice(idx, 1);
    }

    async eventHandler(event: Types.Event, args: Types.EventArgs, triggers: Types.Trigger[], database: Types.Database) {
        this.jobs.forEach(job => {
            if (job.events.includes(event)) {
                job.execute(event, args, triggers, database);
            }
        });
    }

}

export default JobManager;