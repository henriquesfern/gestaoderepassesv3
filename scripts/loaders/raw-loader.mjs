/**
 * Ponto de entrada via --import para registrar os hooks de imports ?raw.
 * Node.js v20+ exige module.register() para incluir hooks na cadeia do worker ESM.
 */
import { register } from 'node:module';

register('./raw-loader-hooks.mjs', import.meta.url);
