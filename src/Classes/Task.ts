
import * as Types from "../index";

const Task: Types.TaskConstructor = class Task implements Types.TaskInterface {

    public execute: Types.TaskExecute;
    constructor(
        public id: Types.TaskID,
        public events: Types.UtilEvent[],
        task: Types.TaskExecute
    ) { this.execute = task; }

}

export default Task;