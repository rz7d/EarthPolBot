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

import axios, { AxiosResponse } from "axios";
import config from "../config.json";

export interface vec2 {
  x: number;
  z: number;
}

export interface NamedCoordInfo extends vec2 {
  name: string;
}

export type NamedCoordDictionary = { [k: string]: vec2 };

export async function delay(millis: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

export async function get<T>(url: string): Promise<AxiosResponse<T> | null> {
  try {
    return await axios({
      method: "GET",
      url,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": config.userAgent,
      },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function debug(message: any) {
  if (config.log.debug) {
    console.debug(message);
  }
}
