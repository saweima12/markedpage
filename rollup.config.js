import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import sucrase from '@rollup/plugin-sucrase';
import commonjs from '@rollup/plugin-commonjs';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

export default [
  {
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      sucrase({ transforms: ['typescript'] }),
      excludeDependenciesFromBundle({ dependencies: true })
    ],
    input: ['src/index.ts'],
    output: [{ file: "./dist/index.js", format: 'es', sourcemap: false }]
  },
  {
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      sucrase({ transforms: ['typescript'] }),
      excludeDependenciesFromBundle({ dependencies: true })
    ],
    input: ['src/helper.ts'],
    output: [{ file: "./dist/helper.js", format: 'es', sourcemap: false }]
  },
  {
    plugins: [dts()],
    input: ['src/index.ts'],
    output: [{ file: 'dist/index.d.ts', format: 'es' }]
  },
  {
    plugins: [dts()],
    input: ['src/helper.ts'],
    output: [{ file: 'dist/helper.d.ts', format: 'es' }]
  }
];
