import assert from "node:assert/strict";
import test from "node:test";
import { AgySession } from "../src/agyRunner.js";
import type { RunnerEvent } from "../src/protocol.js";

test("AgySession parses init event and emits meta with built-in tools and model", () => {
  const events: RunnerEvent[] = [];
  const session = new AgySession((event) => events.push(event), "D:/ps1/agy/Pixel-Crew");

  (session as any).handleAgyEvent({
    event: "init",
    conversation_id: "test-conv-123",
    init: {
      cwd: "D:/ps1/agy/Pixel-Crew",
      tools: ["read_file", "write_file", "run_command"],
      permission_mode: "request-review",
    },
  });

  assert.equal(session.getPersistenceState().sessionId, "test-conv-123");
  assert.equal(events.length, 1);
  const meta = events[0] as Extract<RunnerEvent, { type: "meta" }>;
  assert.equal(meta.type, "meta");
  assert.equal(meta.model, "gemini-3.8-flash-medium");
  assert.deepEqual(meta.builtinTools, ["read_file", "write_file", "run_command"]);
});

test("AgySession parses step_update text_delta and tool_call start/done", () => {
  const events: RunnerEvent[] = [];
  const session = new AgySession((event) => events.push(event), "D:/ps1/agy/Pixel-Crew");

  // text_delta
  (session as any).handleAgyEvent({
    event: "step_update",
    step_update: {
      step_index: 1,
      state: "ACTIVE",
      step_type: "agent_response",
      text_delta: "Hello from Antigravity!",
    },
  });

  assert.equal(events.length, 1);
  assert.deepEqual(events[0], { type: "text_delta", text: "Hello from Antigravity!" });

  // tool start
  (session as any).handleAgyEvent({
    event: "step_update",
    step_update: {
      step_index: 2,
      state: "ACTIVE",
      step_type: "tool",
      tool_name: "read_file",
      tool_info: {
        name: "read_file",
        parameters: { Path: "foo.txt" },
      },
    },
  });

  assert.equal(events.length, 2);
  assert.equal(events[1].type, "tool_call_start");
  if (events[1].type === "tool_call_start") {
    assert.equal(events[1].name, "read_file");
    assert.deepEqual(events[1].input, { Path: "foo.txt" });
  }

  // tool done
  (session as any).handleAgyEvent({
    event: "step_update",
    step_update: {
      step_index: 2,
      state: "DONE",
      step_type: "tool",
      tool_name: "read_file",
      tool_info: {
        name: "read_file",
        parameters: { Path: "foo.txt" },
        output: "file content here",
      },
    },
  });

  assert.equal(events.length, 3);
  assert.equal(events[2].type, "tool_call_result");
  if (events[2].type === "tool_call_result") {
    assert.equal(events[2].output, "file content here");
    assert.equal(events[2].isError, false);
  }
});

test("AgySession parses result event and emits turn_end", () => {
  const events: RunnerEvent[] = [];
  const session = new AgySession((event) => events.push(event), "D:/ps1/agy/Pixel-Crew");
  session.busy = true;

  (session as any).handleAgyEvent({
    event: "result",
    result: {
      conversation_id: "test-conv-123",
      status: "SUCCESS",
      response: "Final response from model.",
      duration_seconds: 2.5,
      usage: {
        total_tokens: 1250,
      },
    },
  });

  assert.equal(session.busy, false);
  assert.equal(session.getPersistenceState().completedTurns, 1);
  assert.equal(events.length, 1);
  const end = events[0] as Extract<RunnerEvent, { type: "turn_end" }>;
  assert.equal(end.type, "turn_end");
  assert.equal(end.resultText, "Final response from model.");
  assert.equal(end.durationMs, 2500);
  assert.equal(end.isError, false);
  assert.equal(end.contextTokens, 1250);
});
