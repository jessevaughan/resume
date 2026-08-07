// Argument parsing that refuses to guess.
//
// The failure worth designing against is the silent one: `-- write` instead of
// `--write` used to parse cleanly, print a full report, and never write the
// file. Nothing announced that two arguments had been dropped on the floor.
// So anything unrecognised is an error here, and a stray `--` gets named
// specifically, because npm has already eaten the real separator by the time
// a script sees its arguments.

/**
 * @param argv  process.argv.slice(2)
 * @param spec  { "--flag": "value" | "boolean" }
 * @returns     { values, positionals, errors }
 */
export function parseFlags(argv, spec) {
  const known = Object.keys(spec);
  const values = {};
  const positionals = [];
  const errors = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg in spec) {
      if (spec[arg] === "boolean") {
        values[arg] = true;
        continue;
      }
      const value = argv[++i];
      if (value === undefined || value.startsWith("-")) {
        errors.push(`${arg} needs a value`);
        i--;
      } else {
        values[arg] = value;
      }
    } else if (arg === "--") {
      const next = argv[i + 1];
      if (known.includes(`--${next}`)) {
        errors.push(`"-- ${next}" is two arguments. Write it as --${next}`);
        i++;
      } else {
        errors.push(`stray "--"`);
      }
    } else if (arg.startsWith("-")) {
      errors.push(`unknown option "${arg}". Known: ${known.join(", ")}`);
    } else {
      positionals.push(arg);
    }
  }
  return { values, positionals, errors };
}

/** Print every problem at once, then the usage line, then stop. */
export function failArgs(errors, usage) {
  for (const problem of errors) console.error(`  ${problem}`);
  console.error(`\n  ${usage}\n`);
  process.exit(1);
}
