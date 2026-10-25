import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Execute the real module with explicit dependency doubles, without Next's server runtime.
export function loadTs(file, mocks = {}) {
  const filename = path.resolve(file);
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  const exports = {};
  const require = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', outputText)(require, exports);
  return exports;
}
