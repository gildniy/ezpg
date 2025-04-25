/// <reference types="node" />
import { Buffer } from "buffer";
// Basic type declaration for hi-base32
declare module "hi-base32" {
  function encode(input: Buffer | ArrayBuffer | string): string;
  // Add decode if you were to implement/find a decoder
  // function decode(input: string): Buffer;
  export = encode;
}
