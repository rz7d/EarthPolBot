import {
  debug,
  get,
  NamedCoordDictionary,
  NamedCoordInfo,
  vec2,
} from "../core";
import { log } from "../log";
import { sendEmbed } from "../discord";
import { load, save } from "../presistent";

const ENDPOINT = "https://earthpol.com/altmap/tiles/world/markers.json";
const PRESISTENT_FILE = "towns.json";

interface MarkerCollection {
  hide: boolean;
  z_index: number;
  name: string;
  control: boolean;
  id: string;
  markers: Marker[];
  order: number;
  timestamp: number;
}

interface Marker {
  tooltip_anchor: vec2;
  size: vec2;
  anchor: vec2;
  tooltip: string;
  icon: string;
  type: string;
  point: vec2; // location of town
}

type TownInfo = NamedCoordInfo;

// ^\s*"tooltip"\s*:\s*"(\\r\\n\\u003cdiv\\u003e\\r\\n    \\u003cbold\\u003e(?<townname>.+)\\u003c\/bold\\u003e\\r\\n\\u003c\/div\\u003e\\r\\n)",$
function tooltipToName(tooltip: string): string {
  return tooltip
    .replaceAll("\r\n\u003cdiv\u003e\r\n    \u003cbold\u003e", "")
    .replaceAll("\u003c/bold\u003e\r\n\u003c/div\u003e\r\n", "");
}

async function notifyCoord(
  title: string,
  description: string,
  color: number,
  { x, z }: vec2
) {
  await log(`${title}: ${description} ${x} ${z}`);
  return await sendEmbed({
    title,
    url: `https://earthpol.com/altmap/?zoom=8&x=${x}&z=${z}`,
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

async function checkTownDifferences(currentList: TownInfo[]) {
  const previousList = await load<TownInfo[]>(PRESISTENT_FILE);
  if (previousList) {
    const previousDict: NamedCoordDictionary = {};
    const currentDict: NamedCoordDictionary = {};
    currentList?.forEach(({ name, x, z }) => (currentDict[name] = { x, z }));
    previousList?.forEach(({ name, x, z }) => (previousDict[name] = { x, z }));

    const all = previousList
      .concat(currentList)
      .sort((a, b) =>
        Number(
          (BigInt(a.x) + BigInt(30000000)) * BigInt(60000000) +
            BigInt(a.z) -
            ((BigInt(b.x) + BigInt(30000000)) * BigInt(60000000) + BigInt(b.z))
        )
      );
    // rename = 2 towns on same position in same tick
    const renamed = new Set<string>();
    for (let i = 1; i < all.length; ++i) {
      const a = all[i - 1];
      const b = all[i];

      if (a.x === b.x && a.z === b.z && a.name !== b.name) {
        const ordered = a.name in previousDict;
        const { name: prev } = ordered ? a : b;
        const { name: next } = ordered ? b : a;
        await notifyCoord(
          "Town Renamed",
          `Town "${prev}" has been renamed to \"${next}\".`,
          0xffff00,
          a
        );
        renamed.add(prev);
        renamed.add(next);
      }
    }

    for (const town of all) {
      const { name } = town;
      if (renamed.has(name)) {
        continue;
      }
      if (!(name in previousDict)) {
        await notifyCoord(
          "Town Created",
          `Town "${name}" has been created.`,
          0x00ff00,
          town
        );
      } else if (!(name in currentDict)) {
        await notifyCoord(
          "Town Abandoned",
          `Town "${name}" has been abandoned.`,
          0xff0000,
          town
        );
      }
    }
  }
  await save(PRESISTENT_FILE, currentList);
}

export async function pollTown(): Promise<void> {
  console.log(`GET: ${ENDPOINT}`);
  const result = await get<MarkerCollection[]>(ENDPOINT);
  debug(result.data);
  for (const collection of result.data) {
    if (collection.name === "Towny") {
      const { markers } = collection;
      return await checkTownDifferences(
        markers
          .filter((t) => t.point)
          .map<TownInfo>((town) => ({
            name: tooltipToName(town.tooltip),
            x: town.point.x,
            z: town.point.z,
          }))
      );
    }
  }
}
