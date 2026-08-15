import { z } from 'zod';

/**
 * Verified against a live `jsonplaceholder` response (`GET /users?_limit=1` and `GET /users/1`) on
 * 2026-08-15: `id`/`name`/`username`/`email` match this schema exactly — no drift. The live payload
 * also carries `address`, `phone`, `website` and `company`, none of which are consumed anywhere in
 * this app; they are deliberately left undeclared. Zod object schemas strip unknown keys by default
 * (no `.passthrough()`), so parsing a full 8-field payload still succeeds and yields only these four
 * — asserted explicitly in `user-api.test.ts` so a future `.strict()` addition cannot silently break
 * every call against a perfectly valid payload.
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
});

export const UserArraySchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
