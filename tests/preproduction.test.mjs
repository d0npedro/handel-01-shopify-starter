import test from "node:test";
import assert from "node:assert/strict";
import { validatePreproductionFiles } from "../scripts/verify-preproduction.mjs";

test("pre-production single-product routing, demo article and social preview are complete", async () => {
  const result = await validatePreproductionFiles();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
});
