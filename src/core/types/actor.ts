export type Actor = {
  userId: number;
};

export type WithActor<T> = T & Actor;
