import { promises } from "fs";
import config from "../config.json";

const IN_MEMORY_DATA: { [filename: string]: any } = {};

export function isPersistent(module: string): boolean {
  const { persistentData } = config;
  if (!(module in persistentData)) {
    console.error(`Module "${module}" is not installed of configured!`);
    return false;
  }
  return (persistentData as { [k: string]: boolean })[module];
}

export async function load<T>(
  module: string,
  filename: string
): Promise<T | null> {
  if (isPersistent(module)) {
    try {
      const json = await promises.readFile(filename, { encoding: "utf-8" });
      return JSON.parse(json);
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  return IN_MEMORY_DATA[filename];
}

export async function save(
  module: string,
  filename: string,
  object: any
): Promise<void> {
  if (isPersistent(module)) {
    await promises.writeFile(filename, JSON.stringify(object), {
      encoding: "utf-8",
    });
    return;
  }
  IN_MEMORY_DATA[filename] = object;
}
