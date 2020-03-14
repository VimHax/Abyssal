
import DiscordJS from "discord.js";
import EventEmitter from "events";

import Database from "./Classes/Database";
import Util from "./Classes/Util";
import Trigger from "./Classes/Trigger";
import TriggerManager from "./Classes/TriggerManager";
import Job from "./Classes/Job";
import JobManager from "./Classes/JobManager";
import Client from "./Classes/Client";

// Database //

export type DocumentValue = any;
export type DocumentProperty = string;
export type Document = {
    [key: string]: DocumentValue;
};

export type Query = Document;

export interface DatabaseInterface {
    initialize: () => Promise<void>;
    find: (query: Query) => Promise<Document[]>;
    findOne: (query: Query) => Promise<Document | undefined>;
    update: (query: Query, document: Document) => Promise<void>;
    insert: (document: Document) => Promise<void>;
    delete: (query: Query) => Promise<void>;
}

// Util //

export type TriggerID = string;
export type TriggerSession = string;
export type Event = string | symbol;
export type EventArgs = any[];
export type State = Document;
export type StateProperty = DocumentProperty;
export type StateValue = DocumentValue;

export interface UtilInterface {
    id: TriggerID;
    state: State;
    session: TriggerSession;
    database: Database;
    getStateProperty: (property: StateProperty) => StateValue | undefined;
    setStateProperty: (property: StateProperty, value: StateValue) => void;
    deleteStateProperty: (property: StateProperty) => void;
    loadState: () => Promise<void>;
    saveState: () => Promise<void>;
    deleteState: () => Promise<void>;
    addListener: (event: Event) => Promise<void>;
    removeListener: (event: Event) => Promise<void>;
    removeAllListeners: () => Promise<void>;
}

// Trigger //

export type TriggerExecutor = (event: Event, args: EventArgs, util: Util) => Promise<void>;
export type TriggerValidator = (event: Event, args: EventArgs, util: Util) => Promise<boolean>;
export type EventListener = (args: EventArgs, util: Util) => void;

export interface TriggerInterface extends EventEmitter.EventEmitter {
    id: TriggerID;
    events: Event[];
    eventListeners: Event[];
    execute: TriggerExecutor
    validate: TriggerValidator;
    eventHandler: (event: Event, args: EventArgs, util: Util) => void;
    on: (event: Event, listener: EventListener) => this;
}

export interface TriggerConfig {
    id: TriggerID,
    events: Event[],
    eventListeners: Event[],
    executor: TriggerExecutor,
    validator: TriggerValidator
}

// Trigger-Manager //

export interface TriggerManagerInterface {
    add: (trigger: Trigger) => void;
    remove: (id: TriggerID) => void;
    eventHandler: (event: Event, args: EventArgs, database: Database) => Promise<Trigger[]>;
}

// Job //

export type JobID = string;
export type JobExecutor = (event: Event, args: EventArgs, triggers: Trigger[], database: Database) => Promise<void>;

export interface JobInterface {
    id: JobID;
    events: Event[];
    execute: JobExecutor;
}

// Job-Manager //

export interface JobManagerInterface {
    add: (job: Job) => void;
    remove: (id: JobID) => void;
    eventHandler: (event: Event, args: EventArgs, triggers: Trigger[], database: Database) => void;
}

// Client //

export type ClientConfig = {
    database: Database,
    triggerManager: TriggerManager,
    jobManager: JobManager,
    clientOptions?: DiscordJS.ClientOptions
};

export interface ClientInterface extends DiscordJS.Client {
    config: ClientConfig;
    database: Database;
    triggerManager: TriggerManager;
    clientOptions?: DiscordJS.ClientOptions;
}

export {
    Database,
    Util,
    Trigger,
    TriggerManager,
    Job,
    JobManager,
    Client
}