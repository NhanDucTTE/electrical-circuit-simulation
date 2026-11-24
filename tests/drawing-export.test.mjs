import test from "node:test";
import assert from "node:assert/strict";
import {pathStrokes} from "../src/drawing-export.mjs";

test("CAD preserves every corner, relative pen lift and disconnected stroke", () => {
  const strokes = pathStrokes("M-58 0H-14 M58 0H14L-14 -10m0-5v-4h3", () => []);
  assert.deepEqual(strokes, [
    {vertices: [[-58, 0], [-14, 0]], closed: false},
    {vertices: [[58, 0], [14, 0], [-14, -10]], closed: false},
    {vertices: [[-14, -15], [-14, -19], [-11, -19]], closed: false},
  ]);
});

test("CAD keeps a closed symbol separate from its next connection", () => {
  const strokes = pathStrokes("m0 2 3 5 9 -4z m9 3h8", () => []);
  assert.deepEqual(strokes, [
    {vertices: [[0, 2], [3, 7], [12, 3]], closed: true},
    {vertices: [[9, 5], [17, 5]], closed: false},
  ]);
});

test("CAD preserves reflected quadratic control and arc endpoints", () => {
  const calls = [];
  const strokes = pathStrokes("M0 0q3-5 6 0t6 0a2 3 0 0 1 4 0", geometry => {
    calls.push(geometry);
    return [];
  });
  assert.deepEqual(calls, ["M 0 0 Q 3 -5 6 0", "M 6 0 Q 9 5 12 0", "M 12 0 A 2 3 0 0 1 16 0"]);
  assert.deepEqual(strokes[0].vertices, [[0, 0], [6, 0], [12, 0], [16, 0]]);
});
