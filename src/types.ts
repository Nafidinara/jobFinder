import {
  Variant,
  Opt,
  Record,
  nat64,
  text,
  int64,
  Null,
  Vec,
  Principal
} from 'azle'

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

export const Job = Record({
  id: text,
  authorId: Principal,
  bookmark: int64,
  createdAt: nat64,
  updatedAt: Opt(nat64),
  title: text,
  description: text,
  price: int64,
  level: Level,
  payment: Payment,
  authorName: text,
  authorPhone: text,
  authorEmail: text,
  skills: Vec(Category)
})

export const JobPayload = Record({
  title: text,
  description: text,
  price: int64,
  level: Level,
  payment: Payment,
  authorName: text,
  authorPhone: text,
  authorEmail: text,
  skills: Vec(Category)
})

export const Error = Variant({
  NotFound: text,
  InvalidPayload: text,
  AuthenticationError: text,
  DuplicateUser: text
})
