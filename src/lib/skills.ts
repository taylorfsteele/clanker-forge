import { join } from "node:path";
import type { Skill } from "./types.js";
import type { Writer } from "./writer.js";

/** Copy each skill's directory tree into `destRoot/<skill>/…`, one file at a time. */
export function writeSkills(writer: Writer, skills: Skill[], destRoot: string): void {
  for (const skill of skills) {
    copyTree(writer, skill.dir, skill.files, join(destRoot, skill.name));
  }
}

/** Copy a directory tree (given as relative file paths) into `destDir`, one file at a time. */
export function copyTree(writer: Writer, srcDir: string, files: string[], destDir: string): void {
  for (const file of files) {
    writer.copy(join(srcDir, file), join(destDir, ...file.split("/")));
  }
}
