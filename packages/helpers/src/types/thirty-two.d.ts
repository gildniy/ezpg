/// <reference types="node" />

declare module "thirty-two" {
  /* eslint-disable no-unused-vars, no-undef */
  export function encode(data: string | Buffer): { toString(): string };
  export function decode(data: string): Buffer;
  /* eslint-enable no-unused-vars, no-undef */
}
