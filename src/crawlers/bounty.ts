import {
  debug,
  get,
  NamedCoordDictionary,
  NamedCoordInfo,
  setOf,
  vec2,
} from "../core";
import { log } from "../log";
import { sendEmbed } from "../discord";
import { load, save } from "../presistent";
import * as config from "../../config.json";

const ENDPOINT = "https://earthpol.com/altmap/tiles/players.json";
const PERSISTENT_FILE = "logged_in_bounties.json";

interface PlayerList {
  max: number;
  players: Player[];
}

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

interface PlayerInfo extends NamedCoordInfo {
  uuid: string;
}

async function notifyPlayer(
  title: string,
  thumbnail: string,
  description: string,
  color: number,
  { x, z }: vec2
) {
  await log(`${title}: ${description} ${x} ${z}`);
  return await sendEmbed({
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
  const previousList = await load<PlayerInfo[]>(PERSISTENT_FILE);
  if (previousList) {
    const currentDict: NamedCoordDictionary = {};
    const previousDict: NamedCoordDictionary = {};
    currentList?.forEach(({ name, x, z }) => (currentDict[name] = { x, z }));
    previousList?.forEach(({ name, x, z }) => (previousDict[name] = { x, z }));

    const all = setOf(previousList, currentList);
    for (const player of all) {
      const { name, x, z, uuid } = player;
      if (!config.bounty.includes(name)) {
        continue;
      }
      if (!(name in previousDict)) {
        await notifyPlayer(
          "Logged In",
          `https://crafatar.com/avatars/${uuid}`,
          name,
          0x00ff00,
          player
        );
      } else if (!(name in currentDict)) {
        await notifyPlayer(
          "Logged Out",
          `https://crafatar.com/avatars/${uuid}`,
          name,
          0xff0000,
          player
        );
      }
    }
  }
  await save(PERSISTENT_FILE, currentList);
}

export async function pollBounty(): Promise<void> {
  console.log(`GET: ${ENDPOINT}`);
  const result = await get<PlayerList>(ENDPOINT);
  debug(result.data);
  return checkPlayerDifferences(result.data.players);
}
