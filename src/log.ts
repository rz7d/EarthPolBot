import { promises } from "fs";
import { isPersistent } from "./persistent";

async function log(message: string): Promise<void> {
  console.log(message);
  if (isPersistent("log")) {
    await promises.appendFile("log.txt", `${message}\n`);
  }
}

export default log;
