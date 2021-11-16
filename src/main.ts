import * as config from "../config.json";
import { pollBounty } from "./crawlers/bounty";
import { pollTown } from "./crawlers/town";

async function delay(millis: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

async function watch(func: Function, interval: number): Promise<never> {
  for (;;) {
    await func();
    await delay(interval);
  }
}

watch(pollTown, config.interval.town);
watch(pollBounty, config.interval.bounty);
