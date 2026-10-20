import { type ChildProcessWithoutNullStreams } from "node:child_process";
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import type { AgentSession, ExecutionProfile, MessageDocument, MessageImage, SendOptions } from "./providers/session.js";
import { spawnCli, terminateProcessTree } from "./platform/processes.js";
import type { AutoApproveMode } from "./dangerousCommand.js";
import type { ApprovalDecision, RunnerEvent } from "./protocol.js";

export class AgySession implements AgentSession {
  readonly provider = "antigravity" as const;
  private child: ChildProcessWithoutNullStreams | null = null;
  private sessionId: string;
  private completedTurns: number;
  private model: string | undefined = "gemini-3.8-flash-medium";
  private executionProfile: ExecutionProfile = "normal";
  busy = false;
  name = "";

  constructor(
    private readonly onEvent: (event: RunnerEvent) => void,
    readonly workspacePath: string,
    private readonly getPersonaPrompt: () => string = () => "",
    private readonly getAutoApproveMode: () => AutoApproveMode = () => "off",
    initialState?: { sessionId: string; completedTurns: number },
  ) {
    this.sessionId = initialState?.sessionId || randomUUID();
    this.completedTurns = initialState?.completedTurns ?? 0;
  }

  interrupt(): void {
    if (this.child) {
      void terminateProcessTree(this.child);
      this.child = null;
      this.busy = false;
      this.onEvent({
        type: "turn_end",
        resultText: "[Interrupted]",
        costUsd: 0,
        durationMs: 0,
        isError: true,
        permissionDenials: [],
      });
    }
  }

  stop(): void {
    if (this.child) {
      void terminateProcessTree(this.child);
      this.child = null;
      this.busy = false;
    }
  }

  warmup(): void {
    this.ensureChild();
  }

  async reloadMcp(): Promise<"reloaded" | "deferred"> {
    return "reloaded";
  }

  requestPromptRefresh(): void {
    // If idle, recreate child process so next turn will pick up fresh prompt/settings
    if (!this.busy && this.child) {
      void terminateProcessTree(this.child);
      this.child = null;
    }
  }

  resolveApproval(_id: string, _decision: ApprovalDecision): boolean {
    return false;
  }

  handleApprovalBridge(_token: string, _input: unknown): Promise<unknown> | null {
    return null;
  }

  setModel(model: string | undefined): void {
    if (model && model !== this.model) {
      this.model = model;
      if (!this.busy && this.child) {
        void terminateProcessTree(this.child);
        this.child = null;
      }
    }
  }

  getModel(): string | undefined {
    return this.model;
  }

  getPersistenceState(): { sessionId: string; completedTurns: number } {
    return {
      sessionId: this.sessionId,
      completedTurns: this.completedTurns,
    };
  }

  private ensureChild(): ChildProcessWithoutNullStreams {
    if (this.child && !this.child.killed) {
      return this.child;
    }

    const args: string[] = [
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--conversation",
      this.sessionId,
    ];

    if (this.model) {
      args.push("--model", this.model);
    }

    const approveMode = this.getAutoApproveMode();
    if (approveMode === "full" || approveMode === "invincible") {
      args.push("--dangerously-skip-permissions");
    }

    if (this.executionProfile === "read_only_query") {
      args.push("--mode", "plan");
    }

    const child = spawnCli("agy", args, {
      cwd: this.workspacePath,
      env: { ...process.env },
    });

    this.child = child;

    const rl = createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("{")) return;
      try {
        const parsed = JSON.parse(trimmed);
        this.handleAgyEvent(parsed);
      } catch {
        // ignore malformed lines
      }
    });

    child.on("close", () => {
      this.child = null;
      if (this.busy) {
        this.busy = false;
        this.onEvent({
          type: "turn_end",
          resultText: "",
          costUsd: 0,
          durationMs: 0,
          isError: false,
          permissionDenials: [],
        });
      }
    });

    child.on("error", (err) => {
      this.onEvent({ type: "error", message: `Antigravity CLI error: ${err.message}` });
      this.busy = false;
    });

    return child;
  }

  private handleAgyEvent(event: any): void {
    if (event.event === "init") {
      if (event.conversation_id) {
        this.sessionId = event.conversation_id;
      }
      this.onEvent({
        type: "meta",
        model: this.model ?? "gemini-3.8-flash-medium",
        slashCommands: ["/help", "/clear", "/exit", "/goal", "/mode", "/model"],
        mcpServers: [],
        toolCount: event.init?.tools?.length ?? 0,
        builtinTools: event.init?.tools ?? [],
      });
      return;
    }

    if (event.event === "step_update" && event.step_update) {
      const update = event.step_update;
      if (update.step_type === "agent_response" && update.text_delta) {
        this.onEvent({ type: "text_delta", text: update.text_delta });
      } else if (update.step_type === "tool" || update.step_type === "tool_call") {
        const id = String(update.step_index ?? randomUUID());
        const toolName = update.tool_name ?? update.tool_info?.name ?? "unknown_tool";
        if (update.state === "ACTIVE") {
          this.onEvent({
            type: "tool_call_start",
            id,
            name: toolName,
            input: update.tool_info?.parameters ?? {},
          });
        } else if (update.state === "DONE") {
          this.onEvent({
            type: "tool_call_result",
            id,
            output: update.tool_info?.output ?? "(completed)",
            isError: false,
          });
        }
      }
      return;
    }

    if (event.event === "result" && event.result) {
      const res = event.result;
      this.busy = false;
      this.completedTurns++;
      this.onEvent({
        type: "turn_end",
        resultText: res.response ?? "",
        durationMs: (res.duration_seconds ?? 0) * 1000,
        costUsd: 0,
        isError: res.status !== "SUCCESS",
        permissionDenials: [],
        contextTokens: res.usage?.total_tokens,
      });
    }
  }

  send(
    text: string,
    _images?: MessageImage[],
    _documents?: MessageDocument[],
    options?: SendOptions,
  ): void {
    this.executionProfile = options?.executionProfile ?? "normal";
    const child = this.ensureChild();
    this.busy = true;

    // Inject persona prompt if first turn or refreshed
    let fullPrompt = text;
    if (this.completedTurns === 0) {
      const persona = this.getPersonaPrompt();
      if (persona.trim()) {
        fullPrompt = `${persona}\n\n---\n\n${text}`;
      }
    }

    this.onEvent({ type: "user_message", text });

    const msg = {
      event: "user",
      message: {
        content: fullPrompt,
      },
    };

    child.stdin.write(JSON.stringify(msg) + "\n");
  }
}
