import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";

export type WriteStatus = "create" | "update" | "unchanged" | "skip";

export interface WriteResult {
  path: string;
  status: WriteStatus;
  note?: string;
}

/**
 * Writes generated files, with a dry-run mode that reports intended changes instead of
 * applying them. Refuses to write to any path that resolves back inside this repo (e.g.
 * a tool config dir symlinked into the source tree), mirroring `bin/link-skills.sh`.
 */
export class Writer {
  readonly results: WriteResult[] = [];

  constructor(
    private readonly opts: { dryRun: boolean; repoRoot: string },
  ) {}

  write(path: string, content: string): WriteResult {
    const abs = resolve(path);
    const guard = this.guard(abs);
    if (guard) return this.record({ path: abs, status: "skip", note: guard });

    const existing = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    if (existing === content) {
      return this.record({ path: abs, status: "unchanged" });
    }
    const status: WriteStatus = existing === null ? "create" : "update";

    if (!this.opts.dryRun) {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    return this.record({ path: abs, status });
  }

  /** Byte-for-byte copy of a source file, preserving binary content (skills ship images etc.). */
  copy(src: string, dest: string): WriteResult {
    const abs = resolve(dest);
    const guard = this.guard(abs);
    if (guard) return this.record({ path: abs, status: "skip", note: guard });

    const content = readFileSync(src);
    const existing = existsSync(abs) ? readFileSync(abs) : null;
    if (existing?.equals(content)) {
      return this.record({ path: abs, status: "unchanged" });
    }
    const status: WriteStatus = existing === null ? "create" : "update";

    if (!this.opts.dryRun) {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    return this.record({ path: abs, status });
  }

  skip(path: string, note: string): WriteResult {
    return this.record({ path: resolve(path), status: "skip", note });
  }

  private guard(abs: string): string | undefined {
    const root = realpathSync(this.opts.repoRoot);
    // Resolve the nearest existing ancestor so symlinked parents are caught too.
    let probe = abs;
    while (!existsSync(probe) && dirname(probe) !== probe) probe = dirname(probe);
    let real: string;
    try {
      real = realpathSync(probe);
    } catch {
      return undefined;
    }
    const rel = relative(root, real);
    if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
      return `target resolves inside the repo (${real}); refusing to write through a loop`;
    }
    return undefined;
  }

  private record(result: WriteResult): WriteResult {
    this.results.push(result);
    return result;
  }
}
