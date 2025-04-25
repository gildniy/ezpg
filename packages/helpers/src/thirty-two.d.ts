/// <reference types="node" />
import { Buffer } from "buffer";
// Basic type declaration for thirty-two
declare module "thirty-two" {
  function decode(encoded: string): Buffer;
  function encode(plain: string | Buffer): string;
  export { decode, encode };
}
