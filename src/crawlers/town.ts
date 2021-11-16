import {
  debug,
  get,
  NamedCoordDictionary,
  NamedCoordInfo,
  notifyCoord,
  setOf,
  vec2,
} from "../core";
import { notify } from "../discord";
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

async function checkTownDifferences(currentList: TownInfo[]) {
  const previousList = await load<TownInfo[]>(PRESISTENT_FILE);
  if (previousList) {
    const previousDict: NamedCoordDictionary = {};
    const currentDict: NamedCoordDictionary = {};
    currentList?.forEach(({ name, x, z }) => (currentDict[name] = { x, z }));
    previousList?.forEach(({ name, x, z }) => (previousDict[name] = { x, z }));

    const all = setOf(previousList, currentList);
    for (const town of all) {
      const { name } = town;
      if (!(name in previousDict)) {
        await notifyCoord(
          "Town Created",
          `Town "${name}" has been created.`,
          0x00ff00,
          town
        );
      } else if (!(name in currentDict)) {
        await notifyCoord(
          "Town Deleted",
          `Town "${name}" has been deleted.`,
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
