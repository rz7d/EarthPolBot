// Copyright (C) 2021 rz7d
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
