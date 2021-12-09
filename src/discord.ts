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
