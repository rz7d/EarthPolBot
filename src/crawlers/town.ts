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

import { debug, delay, get, NamedCoordInfo, vec2 } from "../core";
import log from "../log";
import { sendEmbed } from "../discord";
import { load, save } from "../persistent";
import * as config from "../../config.json";

const ENDPOINT = "https://earthpol.com/altmap/tiles/world/markers.json";
const PRESISTENT_FILE = "towns.json";

interface Marker {
  tooltip_anchor: vec2;
  size: vec2;
  anchor: vec2;
  tooltip: string;
  icon: string;
  type: string;
  point: vec2; // location of town
}

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

type TownInfo = NamedCoordInfo;

// ^\s*"tooltip"\s*:\s*"(\\r\\n\\u003cdiv\\u003e\\r\\n    \\u003cbold\\u003e(?<townname>.+)\\u003c\/bold\\u003e\\r\\n\\u003c\/div\\u003e\\r\\n)",$
function tooltipToName(tooltip: string): string {
  return tooltip
    .replaceAll("\r\n\u003cdiv\u003e\r\n    \u003cbold\u003e", "")
    .replaceAll("\u003c/bold\u003e\r\n\u003c/div\u003e\r\n", "")
    .trim();
}

function notifyCoord(
  title: string,
  description: string,
  color: number,
  { x, z }: vec2
) {
  // no-await
  log(`${title}: ${description} ${x} ${z}`);
  sendEmbed({
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
  const previousList = await load<TownInfo[]>("town", PRESISTENT_FILE);
  if (previousList) {
    const currentNames = currentList?.reduce<Set<string>>(
      (set, { name }) => set.add(name),
      new Set()
    );
    const previousNames = previousList?.reduce<Set<string>>(
      (set, { name }) => set.add(name),
      new Set()
    );
    const all = previousList
      .concat(currentList)
      .sort((a, b) =>
        Number(
          (BigInt(a.x) + BigInt(30000000)) * BigInt(60000000) +
            BigInt(a.z) -
            ((BigInt(b.x) + BigInt(30000000)) * BigInt(60000000) + BigInt(b.z))
        )
      );

    const sameSize = previousList.length === currentList.length;

    // rename = 2 towns on same position in same tick
    const renamed = new Set<string>();
    let listsAreNotChanged = sameSize;

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < all.length; ++i) {
      const a = all[i - 1];
      const b = all[i];

      // eslint-disable-next-line no-bitwise
      if (sameSize && (i & 1) === 1) {
        // (0, 1), (2, 3), (4, 5), ...
        // if not changed, list entries are [a, a, b, b, c, c, ...]
        // but changed, list entries are [a, a', b, b', c, c', ...]
        listsAreNotChanged &&= a.name === b.name && a.x === b.x && a.z === b.z;
      }

      if (a.x === b.x && a.z === b.z && a.name !== b.name) {
        const ordered = previousNames.has(a.name);
        const { name: prev } = ordered ? a : b;
        const { name: next } = ordered ? b : a;
        notifyCoord(
          "Town Renamed",
          `Town "${prev}" has been renamed to "${next}".`,
          0xffff00,
          a
        );
        renamed.add(prev);
        renamed.add(next);
      }
    }

    if (listsAreNotChanged) {
      // skip if not changed
      return;
    }

    all
      .filter(({ name }) => !renamed.has(name))
      .forEach(async (town) => {
        const { name } = town;
        if (!previousNames.has(name)) {
          notifyCoord(
            "Town Created",
            `Town "${name}" has been created.`,
            0x00ff00,
            town
          );
        } else if (!currentNames.has(name)) {
          notifyCoord(
            "Town Abandoned",
            `Town "${name}" has been abandoned.`,
            0xff0000,
            town
          );
        }
      });
  }
  await save("town", PRESISTENT_FILE, currentList);
}

export async function pollTown(): Promise<void> {
  console.log(`GET: ${ENDPOINT}`);
  const result = await get<MarkerCollection[]>(ENDPOINT);
  if (!result) {
    return;
  }
  debug(result.data);
  for (const collection of result.data) {
    if (collection.name === "Towny") {
      const { markers } = collection;
      await checkTownDifferences(
        markers
          .filter((t) => t.point)
          .map<TownInfo>((town) => ({
            name: tooltipToName(town.tooltip),
            x: town.point.x,
            z: town.point.z,
          }))
      );
      break;
    }
  }
}

export async function watch(): Promise<never> {
  for (;;) {
    await pollTown();
    await delay(config.town.interval);
  }
}
