import { watch as watchDiscord } from "./discord";
import { watch as watchBounty } from "./crawlers/bounty";
import { watch as watchTown } from "./crawlers/town";

watchDiscord();
watchBounty();
watchTown();
