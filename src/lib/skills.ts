import { join } from "node:path";
import type { Skill } from "./types.js";
import type { Writer } from "./writer.js";

/** Copy each skill's directory tree into `destRoot/<skill>/…`, one file at a time. */
export function writeSkills(writer: Writer, skills: Skill[], destRoot: string): void {
  for (const skill of skills) {
    for (const file of skill.files) {
      writer.copy(join(skill.dir, file), join(destRoot, skill.name, ...file.split("/")));
    }
  }
}
