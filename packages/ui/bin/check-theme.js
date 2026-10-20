#!/usr/bin/env node
// Checks the contrast of a theme: `panneau-check-theme theme.json`. See `--help`.
import { runCheckTheme } from '../dist/theme/cli.js';

process.exitCode = await runCheckTheme(process.argv.slice(2));
