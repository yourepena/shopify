import { parseArgs } from "node:util";
import { InMemoryItemStore } from "./store/itemStore.js";

/**
 * Minimal CLI built on Node's own arg parser -- no dependency needed.
 *   npm run cli -- add --name Widget --quantity 3
 *   npm run cli -- list
 */
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: "string" },
    quantity: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

const [command = "help"] = positionals;
const store = new InMemoryItemStore();

function usage(): void {
  console.log(`Usage:
  cli list
  cli add --name <name> [--quantity <n>]`);
}

switch (values.help ? "help" : command) {
  case "list":
    console.table(store.list());
    break;

  case "add": {
    if (!values.name) {
      console.error("--name is required");
      process.exitCode = 1;
      break;
    }
    const item = store.create({
      name: values.name,
      quantity: Number(values.quantity ?? 0),
    });
    console.log(`Created ${item.id}`);
    break;
  }

  default:
    usage();
}
