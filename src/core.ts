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
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
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
