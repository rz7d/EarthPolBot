import { notify } from "./discord";

notify({
  title: "Town Created: aaaa",
  color: 0x00FF00,
  fields: [
    {
      name: "X",
      value: `${334}`,
      inline: true,
    },
    {
      name: "Z",
      value: `${334}`,
      inline: true,
    },
  ],
});
