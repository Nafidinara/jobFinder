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
    Principal
} from 'azle';

import { v4 as uuidv4 } from 'uuid';
import {Error, Job, JobPayload} from "./types";

const jobStorage = StableBTreeMap(text, Job, 0);

export default Canister({
    /**
     * Creates a new job.
     * @param JobPayload - Contain all the job payload.
     * @returns the newly created job instance.
     */
    postJob: update([JobPayload], Job, (payload) => {
        const job: typeof Job = {
            id: uuidv4(),
            createdAt: ic.time(),
            createdAt: ic.time(),
            authorId: ic.caller().toString(),
            ...payload
        };

        jobStorage.insert(job.id, job);

        return Ok(job);
    }),
    /**
     * Fetch all users.
     * @returns a list of all users.
     */
    getAllJobs: query([], Vec(Job), () => {
        return jobStorage.values();
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
