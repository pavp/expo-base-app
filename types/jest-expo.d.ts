// `jest-expo` ships no type declarations and `@types/jest-expo` does not exist on npm.
// Declare only what `jest.config.ts` actually consumes from the preset.
declare module 'jest-expo/jest-preset' {
  const preset: {
    transformIgnorePatterns: string[];
  };

  export default preset;
}
