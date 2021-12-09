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

import { promises } from "fs";
import { isPersistent } from "./persistent";

async function log(message: string): Promise<void> {
  console.log(message);
  if (isPersistent("log")) {
    await promises.appendFile("log.txt", `${message}\n`);
  }
}

export default log;
