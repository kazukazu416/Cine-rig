import { generateSetup } from "./generateSetup";

const result = generateSetup([
  {
    id: "cam1",
    model: "FX6",
    wireless: true,
    monitors: [
      { id: "m1", model: "smallhd_cine7",  role: "focus" },
      { id: "m2", model: "atomos_shogun7", role: "director" },
    ],
  },
]);
console.log(JSON.stringify(result, null, 2));
