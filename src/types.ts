import { Variant, Opt, Record, nat64, text, int64, Null, Vec, Principal } from 'azle';

const Category = Record({
    name: text,
    createdAt: nat64,
});

const Level = Variant({
    Entry: Null,
    Intermediate: Null,
    Expert: Null,
});

const Type = Variant({
    Remote: Null,
    Onsite: Null,
    Hybrid: Null,
});

export const Job = Record({
    id: text,
    title: text,
    description: text,
    price: int64,
    level: Level,
    type: Type,
    skills: Vec(Category),
    authorName: text,
    authorPhone: text,
    authorEmail: text,
    authorId: Principal,
    bookmark: int64,
    createdAt: nat64,
    updatedAt: Opt(nat64)
})

export const JobPayload = Record({
    title: text,
    description: text,
    price: int64,
    level: Level,
    type: Type,
    skills: Vec(Category),
    authorName: text,
    authorPhone: text,
    authorEmail: text,
    bookmark: int64,
})

export const Error = Variant({
    NotFound: text,
    InvalidPayload: text,
});
