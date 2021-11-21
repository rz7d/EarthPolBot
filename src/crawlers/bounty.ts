import { debug, delay, get, NamedCoordInfo, vec2 } from "../core";
import log from "../log";
import { sendEmbed, sendMessage } from "../discord";
import { load, save } from "../persistent";
import * as config from "../../config.json";

const ENDPOINT = "https://earthpol.com/altmap/tiles/players.json";
const PERSISTENT_FILE = "logged_in_bounties.json";

interface Player {
  world: string;
  armor: number;
  name: string;
  x: number;
  z: number;
  health: number;
  uuid: string;
  yaw: number;
}

interface PlayerList {
  max: number;
  players: Player[];
}

interface PlayerInfo extends NamedCoordInfo {
  uuid: string;
}

function notifyPlayer(
  title: string,
  thumbnail: string,
  description: string,
  color: number,
  { x, z }: vec2
) {
  log(`${title}: ${description} ${x} ${z}`);
  sendEmbed({
    title,
    url: `https://earthpol.com/altmap/?zoom=8&x=${x}&z=${z}`,
    thumbnail: {
      url: thumbnail,
      height: 150,
      width: 150,
    },
    description,
    color,
    fields: [
      {
        name: "X Pos",
        value: `${x}`,
        inline: true,
      },
      {
        name: "Z Pos",
        value: `${z}`,
        inline: true,
      },
    ],
  });
}

async function checkPlayerDifferences(currentList: PlayerInfo[]) {
  const previousList = await load<PlayerInfo[]>("bounty", PERSISTENT_FILE);
  if (previousList) {
    const currentNames = currentList?.reduce<Set<string>>(
      (set, { name }) => set.add(name),
      new Set()
    );
    const previousNames = previousList?.reduce<Set<string>>(
      (set, { name }) => set.add(name),
      new Set()
    );
    const all = previousList.concat(currentList);
    for (const player of all) {
      const { name, uuid } = player;
      if (config.bounty.targets.includes(name)) {
        if (!previousNames.has(name)) {
          notifyPlayer(
            "Logged In",
            `https://crafatar.com/avatars/${uuid}`,
            name,
            0x00ff00,
            player
          );
          if (name in config.bounty.alert) {
            const message = (config.bounty.alert as { [k: string]: string })[
              name
            ];
            sendMessage(message);
          }
        } else if (!currentNames.has(name)) {
          notifyPlayer(
            "Logged Out",
            `https://crafatar.com/avatars/${uuid}`,
            name,
            0xff0000,
            player
          );
        }
      }
    }
  }
  await save("bounty", PERSISTENT_FILE, currentList);
}

export async function pollBounty(): Promise<void> {
  console.log(`GET: ${ENDPOINT}`);
  const result = await get<PlayerList>(ENDPOINT);
  if (!result || !result.data || !result.data.players) {
    return;
  }
  debug(result.data);
  await checkPlayerDifferences(result.data.players);
}

export async function watch(): Promise<never> {
  for (;;) {
    await pollBounty();
    await delay(config.bounty.interval);
  }
}
