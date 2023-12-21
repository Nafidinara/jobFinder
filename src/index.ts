import {
    Canister,
    Err,
    ic,
    int64,
    nat64,
    Null,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    Some,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec
} from 'azle'

import {v4 as uuidV4} from 'uuid'
// import {Error, Job, JobPayload } from "./types";

const Category = Record({
    name: text
})

const Level = Variant({
    Entry: Null,
    Intermediate: Null,
    Expert: Null
})

const Payment = Variant({
    Hourly: Null,
    Monthly: Null,
    Fixed: Null
})

const User = Record({
    id: Principal,
    createdAt: nat64,
    updatedAt: Opt(nat64),
    name: text,
    username: text,
    email: text,
    phone: text,
    password: text
})

const UserPayload = Record({
    name: text,
    username: text,
    email: text,
    phone: text,
    password: text
})

const Job = Record({
    id: text,
    authorId: Principal,
    bookmark: int64,
    createdAt: nat64,
    updatedAt: Opt(nat64),
    authorName: text,
    authorPhone: text,
    authorEmail: text,
    title: text,
    description: text,
    price: int64,
    level: Level,
    payment: Payment,
    skills: Vec(Category)
})

const JobPayload = Record({
    // authorName: text,
    // authorPhone: text,
    // authorEmail: text,
    title: text,
    description: text,
    price: int64,
    level: Level,
    payment: Payment,
    skills: Vec(Category)
})

const Error = Variant({
    NotFound: text,
    InvalidPayload: text,
    AuthenticationError: text,
    DuplicateUser: text
})

let currentUser: typeof User | undefined

const jobs = StableBTreeMap(text, Job, 0)
const users = StableBTreeMap(Principal, User, 1)

export default Canister({
    // create new user
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

    // authenticate user
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

    // logout user
    logOut: update([], Result(text, Error), () => {
        if (!currentUser) {
            return Err({AuthenticationError: 'no logged in user'})
        }
        currentUser = undefined
        return Ok('Logged out successfully.')
    }),

    // get current user
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
            bookmark: 0,
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
     * Fetch user by id.
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
    
})

// ID generator
function idGenerator(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256))

    return Principal.fromUint8Array(Uint8Array.from(randomBytes))
}
