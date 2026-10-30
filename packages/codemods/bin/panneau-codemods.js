#!/usr/bin/env node
// Moves a Panneau 4 project to Panneau 5: `panneau-codemods v4-to-v5 <paths...> [--dry]`. See `--help`.
import { runCli } from '../dist/index.js';

process.exitCode = await runCli(process.argv.slice(2));
