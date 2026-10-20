import type { AgentAuthProvider, ProviderAuthState } from "./types.js";
import { execCli } from "../platform/processes.js";
import { buildAuthDebug } from "./authDebug.js";

export class AntigravityAuthProvider implements AgentAuthProvider {
  readonly id = "antigravity" as const;
  readonly displayName = "Antigravity CLI (agy)";
  readonly loginCommand = "agy auth";

  private activeCheck: Promise<ProviderAuthState> | null = null;

  checkAuth(): Promise<ProviderAuthState> {
    if (this.activeCheck) return this.activeCheck;
    this.activeCheck = this.runCheck().finally(() => {
      this.activeCheck = null;
    });
    return this.activeCheck;
  }

  private async runCheck(): Promise<ProviderAuthState> {
    const startedAt = Date.now();
    let error: NodeJS.ErrnoException | null = null;
    let stdout = "";
    let stderr = "";
    try {
      ({ stdout, stderr } = await execCli("agy", ["--version"], {
        timeout: 5_000,
      }));
    } catch (caught) {
      error = caught as NodeJS.ErrnoException;
      stdout = String((caught as any).stdout ?? "");
      stderr = String((caught as any).stderr ?? "");
    }
    const checkedAt = new Date().toISOString();

    if (error) {
      const code = String(error.code ?? "");
      const status = code === "ENOENT" ? "cli_missing" : "error";
      return {
        provider: "antigravity",
        displayName: this.displayName,
        status,
        loginCommand: this.loginCommand,
        checkedAt,
        error: error.message || "Antigravity CLI check failed",
        debug: buildAuthDebug({ command: "agy", args: ["--version"], durationMs: Date.now() - startedAt, stdout, stderr, error }),
      };
    }

    return {
      provider: "antigravity",
      displayName: this.displayName,
      status: "authenticated",
      loginCommand: this.loginCommand,
      checkedAt,
      error: null,
      debug: null,
    };
  }
}
