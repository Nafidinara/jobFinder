import {
    query,
    update,
    Canister,
    text,
    Record,
    StableBTreeMap,
    Ok,
    None,
    Some,
    Err,
    Vec,
    Result,
    nat64,
    ic,
    Opt,
    Variant,
    Void,
    Principal, int64, Null
} from 'azle';

import { v4 as uuidv4 } from 'uuid';
import {Error, Job, JobPayload, User} from "./types";

const jobs = StableBTreeMap(text, Job, 0);
const users = StableBTreeMap(Principal, User, 1);

export default Canister({
    /**
     * Creates a new job.
     * @param JobPayload - Contain all the job payload.
     * @returns the newly created job instance.
     */
    createJob: update([JobPayload], Job, (payload) => {
        const authorId = ic.caller();

        const job: typeof Job = {
            id: uuidv4(),
            authorId,
            bookmark: 2,
            createdAt: ic.time(),
            updatedAt: Null,
            ...payload
        }

        jobs.insert(job.id, job)

        return job;
    }),
    /**
     * Fetch all jobs.
     * @returns a list of all jobs.
     */
    getAllJobs: query([], Vec(Job), () => {
        return jobs.values();
    }),
    /**
     * Fetch all users.
     * @returns a list of all users.
     */
    getAllUsers: query([], Vec(User), () => {
        return users.values();
    }),
});

/**
 * Generate an ID of a type Principal.
 * @returns a Principal ID.
 */
function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
