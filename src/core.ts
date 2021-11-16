import axios, { AxiosResponse } from "axios";

export interface vec2 {
  x: number;
  z: number;
}

export interface NamedCoordInfo extends vec2 {
  name: string;
}

export type NamedCoordDictionary = { [k: string]: vec2 };

export async function get<T>(url: string): Promise<AxiosResponse<T>> {
  return await axios({
    method: "GET",
    url: url,
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    },
  });
}

export function setOf<T>(a: T[], b: T[]): Set<T> {
  const set = new Set<T>();
  a.forEach((e) => set.add(e));
  b.forEach((e) => set.add(e));
  return set;
}

export function debug(message: any) {
  // console.debug(message);
}
