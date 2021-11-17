import axios from "axios";
import * as config from "../config.json";
import { delay } from "./core";

const messageQueue: string[] = [];

export function sendEmbed(embed: any) {
  messageQueue.push(
    JSON.stringify({
      username: config.discord.username,
      avatar_url: config.discord.avatarUrl,
      embeds: [embed],
    })
  );
}

export async function watch() {
  for (;;) {
    await delay(config.discord.resendDelay);
    const message = messageQueue.shift();
    if (message) {
      for (const webhookUrl of config.discord.webhooks) {
        try {
          await axios({
            method: "POST",
            url: webhookUrl,
            headers: {
              "Content-Type": "application/json",
            },
            data: message,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
