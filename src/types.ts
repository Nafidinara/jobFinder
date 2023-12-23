import {bool, int64, nat64, Null, Opt, Principal, Record, text, Variant, Vec} from "azle";

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

export const User = Record({
  id: Principal,
  createdAt: nat64,
  updatedAt: Opt(nat64),
  name: text,
  username: text,
  email: text,
  phone: text,
  isLogged: bool
})

export const UserPayload = Record({
  name: text,
  username: text,
  email: text,
  phone: text,
})

export const Job = Record({
  id: text,
  authorId: Principal,
  applies: Vec(Principal),
  applyCount: int64,
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

export const JobPayload = Record({
  title: text,
  description: text,
  price: int64,
  level: Level,
  payment: Payment,
  skills: Vec(Category)
})

export const Error = Variant({
  NotFound: text,
  InvalidPayload: text,
  AuthenticationError: text,
  DuplicateUser: text
})
