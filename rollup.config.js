import resolve from '@rollup/plugin-node-resolve';
import sucrase from '@rollup/plugin-sucrase';
import commonjs from '@rollup/plugin-commonjs';
import flatDts from 'rollup-plugin-flat-dts';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

export default [
  {
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      sucrase({ transforms: ['typescript'] }),
      excludeDependenciesFromBundle({ dependencies: true })
    ],
    input: {
      index: 'src/index.ts',
      helper: 'src/helper.ts'
    },
    output: [
    { 
      dir: "./dist",
      format: 'es', 
      sourcemap: false, 
      plugins: [
        flatDts({
            entries: {
              helper: {
                as: "helper"
              }
            },
            internal: [
              "sources",
              "classifier",
              "*/internal"
            ],
        })
      ]
    }]
  }
];
