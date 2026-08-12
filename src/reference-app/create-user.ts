import type { InMemoryUserStore } from "./user-store.js";

export interface CreateUserResult {
  username: string;
  created: boolean;
  reason?: "duplicate-username";
}

export type UserCreator = (
  store: InMemoryUserStore,
  username: string
) => CreateUserResult;

export const createUser: UserCreator = (
  store,
  username
) => {
  if (store.has(username)) {
    return {
      username,
      created: false,
      reason: "duplicate-username",
    };
  }

  store.add(username);

  return {
    username,
    created: true,
  };
};