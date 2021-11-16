import axios, { AxiosResponse } from "axios";
import * as config from "../config.json";

export async function notify(embed: any): Promise<AxiosResponse<any>> {
  return await axios({
    method: "POST",
    url: config.webhook.discord,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      username: "EarthPol Bot",
      avater_url: "https://rz7d.vercel.app/earthpol-recipes/logo.png",
      embeds: [embed],
    }),
  });
}
