import config from "../config.json";

Object.keys(config.bounty.alert).forEach(c => {
    console.log(`- ${c}`)
});