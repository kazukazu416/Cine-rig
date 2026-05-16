import { generateSetup } from "./generateSetup";

const result = generateSetup({ camera: "FX6", monitors: 2, wireless: true });
console.log(JSON.stringify(result, null, 2));
