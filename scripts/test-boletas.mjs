// Pruebas de lógica en Node sin navegador. Las pruebas visuales requieren Chrome.
import '@angular/compiler';
import { build } from 'esbuild';
import jasmineCore from 'jasmine-core';
import fs from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const jasmine = jasmineCore.core(jasmineCore);
const env = jasmine.getEnv();
Object.assign(globalThis, jasmineCore.interface(jasmine, env));
globalThis.window = { open() {}, confirm() { return true; }, location: { hostname: 'localhost' } };
globalThis.document = { baseURI: 'https://noelia.example/' };
const carpeta = path.resolve('.angular/boletas-unit');
await fs.mkdir(carpeta, { recursive: true });
const tests = [
  'src/app/models/boleta.spec.ts',
  'src/app/services/boleta-impresion.spec.ts',
  'src/app/components/generar-boleta/generar-boleta.component.spec.ts',
  'src/app/components/compartir-boleta/compartir-boleta.component.spec.ts'
];
await build({ entryPoints: tests, outdir: carpeta, outbase: 'src/app', bundle: true, packages: 'external', platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' } });
let fallos = 0; let cantidad = 0;
env.addReporter({ specDone(r) { cantidad++; if (r.status === 'failed') { fallos++; console.error(r.fullName, r.failedExpectations.map(e => e.message)); } },
  jasmineDone(r) { rmSync(carpeta, { recursive: true, force: true }); console.log(`${cantidad} pruebas, ${fallos} fallos (${r.overallStatus}).`); process.exitCode = r.overallStatus === 'passed' ? 0 : 1; } });
for (const test of tests) {
  const relativo = path.relative('src/app', test).replace(/\.ts$/, '.mjs');
  await import(pathToFileURL(path.join(carpeta, relativo)).href);
}
try { await env.execute(); } finally { await fs.rm(carpeta, { recursive: true, force: true }); }
