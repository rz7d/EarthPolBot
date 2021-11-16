import { promises } from "fs";

const IN_MEMORY = true;
const IN_MEMORY_DATA: { [filename: string]: any } = {};

export async function load<T>(filename: string): Promise<T | null> {
  if (IN_MEMORY) {
    return IN_MEMORY_DATA[filename];
  }
  try {
    const json = await promises.readFile(filename, { encoding: "utf-8" });
    return JSON.parse(json);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function save(filename: string, object: any): Promise<void> {
  if (IN_MEMORY) {
    IN_MEMORY_DATA[filename] = object;
    return;
  }
  return await promises.writeFile(filename, JSON.stringify(object));
}
