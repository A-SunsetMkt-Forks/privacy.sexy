import { Category } from '@/domain/Executables/Category/Category';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { Script } from '@/domain/Executables/Script/Script';
import { ExecutableId, ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import { ScriptStub } from './ScriptStub';
import { ExecutableKeyStub } from './ExecutableKeyStub';

export class CategoryStub implements Category {
  public readonly key: ExecutableKey;

  public name: string;

  public readonly subCategories = new Array<Category>();

  public readonly scripts = new Array<Script>();

  public docs: readonly string[] = new Array<string>();

  private allScriptsRecursively: (readonly Script[]) | undefined;

  public constructor(categoryKeyOrId: ExecutableKey | ExecutableId) {
    this.key = typeof categoryKeyOrId === 'object'
      ? categoryKeyOrId
      : new ExecutableKeyStub().withExecutableId(categoryKeyOrId);
    this.name = `[${CategoryStub.name}]category-with-id-${this.key.createSerializedKey()}`;
  }

  public includes(script: Script): boolean {
    return this.getAllScriptsRecursively().some((s) => s.key === script.key);
  }

  public getAllScriptsRecursively(): readonly Script[] {
    if (this.allScriptsRecursively === undefined) {
      return [
        ...this.scripts,
        ...this.subCategories.flatMap((c) => c.getAllScriptsRecursively()),
      ];
    }
    return this.allScriptsRecursively;
  }

  public withScriptIds(...scriptIds: readonly string[]): this {
    return this.withScripts(
      ...scriptIds.map((id) => new ScriptStub(id)),
    );
  }

  public withScripts(...scripts: Script[]): this {
    for (const script of scripts) {
      this.withScript(script);
    }
    return this;
  }

  public withAllScriptKeysRecursively(...scriptKeys: readonly ExecutableKey[]): this {
    const scripts = scriptKeys.map((key) => new ScriptStub(key));
    return this.withAllScriptsRecursively(...scripts);
  }

  public withAllScriptsRecursively(...scripts: Script[]): this {
    this.allScriptsRecursively = [...scripts];
    return this;
  }

  public withMandatoryScripts(): this {
    return this
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-1`).withLevel(RecommendationLevel.Standard))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-2`).withLevel(RecommendationLevel.Strict))
      .withScript(new ScriptStub(`[${CategoryStub.name}] script-3`).withLevel(undefined));
  }

  public withCategories(...categories: Category[]): this {
    for (const category of categories) {
      this.withCategory(category);
    }
    return this;
  }

  public withCategory(category: Category): this {
    this.subCategories.push(category);
    return this;
  }

  public withScript(script: Script): this {
    this.scripts.push(script);
    return this;
  }

  public withName(categoryName: string): this {
    this.name = categoryName;
    return this;
  }

  public withDocs(docs: readonly string[]): this {
    this.docs = docs;
    return this;
  }
}
