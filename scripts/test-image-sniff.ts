import assert from "node:assert/strict";
import { sniffImageType } from "../src/lib/image-sniff";

// Only the header bytes matter for sniffing — these aren't full valid images.
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const webp = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"),
]);
const avif = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x1c]),
  Buffer.from("ftyp", "ascii"),
  Buffer.from("avif", "ascii"),
]);
const svgDisguisedAsJpg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', "utf8");
const tooShort = Buffer.from([0xff, 0xd8]);
const plainText = Buffer.from("just some text, not an image at all", "utf8");

assert.equal(sniffImageType(jpeg), "jpg", "JPEG magic bytes should be detected");
assert.equal(sniffImageType(png), "png", "PNG magic bytes should be detected");
assert.equal(sniffImageType(webp), "webp", "WebP magic bytes should be detected");
assert.equal(sniffImageType(avif), "avif", "AVIF magic bytes should be detected");
assert.equal(sniffImageType(svgDisguisedAsJpg), null, "SVG must be rejected (not in the allowlist)");
assert.equal(sniffImageType(tooShort), null, "Buffers shorter than the smallest signature must be rejected");
assert.equal(sniffImageType(plainText), null, "Arbitrary non-image bytes must be rejected");

console.log("PASS: image-sniff");
