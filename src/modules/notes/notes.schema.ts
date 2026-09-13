import { Type } from "typebox";
import type { Actor, WithActor } from "@/core/types/actor.js";

export const NoteResponseSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
});

export const NoteCreateBodySchema = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 256 }),
    description: Type.Optional(Type.String({ maxLength: 5000 })),
  },
  {
    additionalProperties: false,
  },
);

export const NoteUpdateBodySchema = Type.Object(
  {
    title: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
    description: Type.Optional(Type.String({ maxLength: 5000 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export const NoteIdParamsSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
});

export type NoteResponse = Type.Static<typeof NoteResponseSchema>;
export type NoteCreateBody = Type.Static<typeof NoteCreateBodySchema>;
export type NoteUpdateBody = Type.Static<typeof NoteUpdateBodySchema>;
export type NoteIdParams = Type.Static<typeof NoteIdParamsSchema>;

export type NoteGetAllInput = Actor;
export type NoteCreateInput = WithActor<NoteCreateBody>;
export type NoteDeleteInput = WithActor<NoteIdParams>;
export type NoteGetByIdInput = WithActor<NoteIdParams>;
export type NoteUpdateInput = WithActor<NoteIdParams & NoteUpdateBody>;
