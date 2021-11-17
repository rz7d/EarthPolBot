import axios, { AxiosResponse } from "axios";
import * as config from "../config.json";
import { delay } from "./core";

export async function sendEmbed(
  embed: any
): Promise<AxiosResponse<any> | null> {
  try {
    const response = await axios({
      method: "POST",
      url: config.webhook.discord,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        username: "EarthPol Bot",
        avatar_url: "https://rz7d.vercel.app/earthpol-recipes/logo.png",
        embeds: [embed],
      }),
    });
    await delay(300);
    return response;
  } catch (e) {
    console.error(e);
  }
  return null;
}
