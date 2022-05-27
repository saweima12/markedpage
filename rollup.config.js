import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import sucrase from '@rollup/plugin-sucrase';
import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";


export default [
  {
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      sucrase({ transforms: ['typescript'] }),
      excludeDependenciesFromBundle({ dependencies: true }),
    ],
    input: 'src/main.ts',
    output: [
      // { file: pkg.main, format: 'cjs', sourcemap: false },
      { file: pkg.module, format: 'es', sourcemap: false }
    ]
  },
  {
    plugins: [dts()],
    input: 'src/main.ts',
    output: [
      { file: 'dist/index.d.ts', format: 'es' }
    ]
  }
];
