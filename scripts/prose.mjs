// Spell and punctuation check the authored copy.
//
//   node scripts/prose.mjs          # check; non-zero exit on any finding
//   node scripts/prose.mjs --list   # unknown words and where they appear
//
// Run `npm run prose`, or `npm run prose -- --list`. The check itself also runs
// inside `npm run pdf` and `npm run docx`, so this script is for looking at the
// copy on its own and for seeding scripts/words.txt.
//
// --list is the maintenance path: it prints every word the dictionary and the
// wordlist don't know, in the casing the copy uses, ready to paste into
// scripts/words.txt. Read the list before pasting it. Anything in there that is
// a real typo becomes permanently invisible to this check the moment it lands
// in the wordlist, which is the one way this guardrail can be defeated.

import { checkProse, listUnknown } from "./lib/prose.mjs";
import { parseFlags, failArgs } from "./lib/cli.mjs";

const SPEC = { "--list": "boolean" };
const USAGE = "npm run prose            (check)\n         npm run prose -- --list";

const { values, positionals, errors } = parseFlags(process.argv.slice(2), SPEC);
for (const extra of positionals) {
  errors.push(`unexpected argument "${extra}"`);
}
if (errors.length) failArgs(errors, USAGE);

if (values["--list"]) {
  const unknown = await listUnknown();
  if (unknown.length === 0) {
    console.log("Every word is in the dictionary or scripts/words.txt.");
  } else {
    console.log(
      `${unknown.length} unknown word(s). Review before pasting into scripts/words.txt:\n`,
    );
    const width = Math.max(...unknown.map(({ word }) => word.length));
    for (const { word, where } of unknown) {
      console.log(`${word.padEnd(width)}  # ${where.slice(0, 3).join(", ")}`);
    }
  }
  process.exit(0);
}

process.exit((await checkProse()) ? 0 : 1);
