import { promises } from "fs";
import * as config from "../config.json";

export async function log(message: string): Promise<void> {
  console.log(message);
  if (config.persistentLog) {
    return await promises.appendFile("log.txt", message);
  }
}
