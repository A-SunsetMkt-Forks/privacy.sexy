import type { CategoryCollectionContext } from '@/application/Parser/Executable/CategoryCollectionContext';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import { ScriptCompilerStub } from './ScriptCompilerStub';

export class CategoryCollectionContextStub
implements CategoryCollectionContext {
  public compiler: ScriptCompiler = new ScriptCompilerStub();

  public language: ScriptLanguage = ScriptLanguage.shellscript;

  public withCompiler(compiler: ScriptCompiler) {
    this.compiler = compiler;
    return this;
  }

  public withLanguage(language: ScriptLanguage) {
    this.language = language;
    return this;
  }
}
