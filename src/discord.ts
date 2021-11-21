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
export function sendMessage(message: string) {
  messageQueue.push(
    JSON.stringify({
      username: config.discord.username,
      avatar_url: config.discord.avatarUrl,
      content: message,
    })
  );
}

export async function watch() {
  for (;;) {
    await delay(config.discord.resendDelay);
    if (messageQueue.length >= 1) {
      const message = messageQueue[0];
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
            messageQueue.shift();
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }
}
