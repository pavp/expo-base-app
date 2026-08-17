// `userApi`, the query keys and the query options are deliberately not re-exported: outside code
// goes through `userRepository`, so reaching past this barrel is never necessary.
export { userRepository } from './repositories/user';
export type { User } from './user.types';
