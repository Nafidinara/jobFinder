import {Canister, Err, ic, Null, Ok, Principal, query, Result, Some, StableBTreeMap, text, update, Vec} from 'azle'

import {v4 as uuidV4} from 'uuid'
import {Error, Job, JobPayload, User, UserPayload} from "./types";

let currentUser: typeof User | undefined

const jobs = StableBTreeMap(text, Job, 0)
const users = StableBTreeMap(Principal, User, 1)

export default Canister({
    /**
     * Creates a new user.
     * @param UserPayload - Contain all the user payload.
     * @returns the newly created user instance.
     */
    registerUser: update([UserPayload], Result(User, Error), (payload) => {
        const user = users
            .values()
            .filter(
                (c: typeof User) =>
                    c.username === payload.username || c.email === payload.email
            )[0]
        if (user) {
            return Err({DuplicateUser: 'user already exists.'})
        }
        const newUser: typeof User = {
            id: idGenerator(),
            createdAt: ic.time(),
            updatedAt: Null,
            ...payload
        }
        users.insert(newUser.id, newUser)
        return Ok(newUser)
    }),

    /**
     * authenticate user.
     * @param text - Contain user username.
     * @param text - Contain user password.
     * @returns success login message.
     */
    loginUser: update(
        [text, text],
        Result(text, Error),
        (username, password) => {
            const user: any = users
                .values()
                .filter((c: typeof User) => c.username === username)[0]
            if (!user) {
                return Err({AuthenticationError: 'user does not exist.'})
            }
            if (user.password !== password) {
                return Err({AuthenticationError: 'incorrect password'})
            }
            currentUser = user
            return Ok(`Logged in as ${currentUser?.username}`)
        }
    ),

    /**
     * logout user.
     * @returns success logout message.
     */
    logOut: update([], Result(text, Error), () => {
        if (!currentUser) {
            return Err({AuthenticationError: 'no logged in user'})
        }
        currentUser = undefined
        return Ok('Logged out successfully.')
    }),

    /**
     * get current user profile.
     * @returns current user username.
     */
    getCurrentUser: query([], Result(text, Error), () => {
        if (!currentUser) {
            return Err({AuthenticationError: 'no logged in user.'})
        }
        return Ok(currentUser.username)
    }),

    /**
     * Creates a new job.
     * @param JobPayload - Contain all the job payload.
     * @returns the newly created job instance.
     */
    storeJob: update([JobPayload], Result(Job, Error), (payload) => {

        if (!currentUser) {
            return Err({AuthenticationError: 'you need to login first.'})
        }

        const job: typeof Job = {
            id: uuidV4(),
            authorId: currentUser.id,
            applies: [],
            applyCount: 0,
            createdAt: ic.time(),
            updatedAt: Null,
            authorName: currentUser.name,
            authorPhone: currentUser.phone,
            authorEmail: currentUser.email,
            ...payload
        }

        jobs.insert(job.id, job)

        return Ok(job)
    }),
    /**
     * Fetch all jobs.
     * @returns a list of all jobs.
     */
    indexJob: query([], Result(Vec(Job), Error), () => {
        return Ok(jobs.values())
    }),
    /**
     * Fetch job by id.
     * @param id - ID of the job.
     * @returns a job instance if exists or an error if job doesn't exist.
     */
    showJob: query([text], Result(Job, Error), (id) => {
        const jobData = jobs.get(id)

        if ('None' in jobData) {
            return Err({NotFound: `cannot find job with ${id} id`})
        }

        const job = jobData.Some

        return Ok(job)
    }),
    /**
     * Fetch job by id and update it.
     * @param id - ID of the job.
     * @param JobPayload - Contain all the job payload.
     * @returns a job instance if exists or an error if job doesn't exist.
     */
    updateJob: update([text, JobPayload], Result(Job, Error), (id, payload) => {

        if (!currentUser) {
            return Err({AuthenticationError: 'you need to login first.'})
        }

        const jobData = jobs.get(id);

        if ('None' in jobData) {
            return Err({NotFound: `cannot find job with ${id} id`})
        }

        const job = jobData.Some

        if (job.authorId.toString() !== currentUser.id.toString()) {
            return Err({AuthenticationError: `you are not this job owner.`})
        }

        const updatedJob = {...job, ...payload, updatedAt: Some(ic.time())}
        jobs.insert(job.id, updatedJob)
        return Ok(updatedJob)
    }),
    /**
     * Fetch job by id and update it.
     * @param id - ID of the job.
     * @param JobPayload - Contain all the job payload.
     * @returns a job instance if exists or an error if job doesn't exist.
     */
    deleteJob: update([text], Result(Job, Error), (id) => {
        if (!currentUser) {
            return Err({AuthenticationError: 'you need to login first.'})
        }

        const jobData = jobs.get(id);

        if ('None' in jobData) {
            return Err({NotFound: `cannot delete job with ${id} id`})
        }

        const job = jobData.Some

        if (job.authorId.toString() !== currentUser.id.toString()) {
            return Err({AuthenticationError: `you are not this job owner.`})
        }

        const deletedJob = jobs.remove(id);

        return Ok(deletedJob.Some)
    }),
    /**
     * User can apply to a job.
     * @param id - ID of the job.
     * @returns a job instance if exists or an error if job doesn't exist.
     */
    applyJob: update([text], Result(Job, Error), (id) => {
        if (!currentUser) {
            return Err({AuthenticationError: 'you need to login first.'})
        }

        const jobData = jobs.get(id);

        const job = jobData.Some

        if (job.authorId.toString() === currentUser.id.toString()) {
            return Err({AuthenticationError: `you can't apply in your own job posted.`})
        }

        const isApply = job.applies.filter(apply => apply.toString() === currentUser?.id.toString());

        if (isApply.length > 0) {
            return Err({DuplicateUser: `you already apply in this job.`})
        }

        const updatedJob = {
            ...job,
            applyCount: BigInt(job.applyCount) + BigInt(1),
            applies: [...job.applies, currentUser.id],
            updatedAt: Some(ic.time())
        }

        jobs.insert(job.id, updatedJob)
        return Ok(updatedJob)
    }),

})

// ID generator
function idGenerator(): Principal {
  const randomBytes = new Array(29)
    .fill(0)
    .map((_) => Math.floor(Math.random() * 256));

  return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
