import test from "node:test";
import assert from "node:assert/strict";
import { validatePreproductionFiles } from "../scripts/verify-preproduction.mjs";

test("pre-production demo catalog, fulfillment documentation and ZIP artifacts are complete", async () => {
  const result = await validatePreproductionFiles();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
});
