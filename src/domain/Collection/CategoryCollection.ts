import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Category } from '@/domain/Executables/Category/Category';
import type { ExecutableId } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { Identifiable } from '../Identifiable/Identifiable';
import type { CategoryCollectionKey } from './Key/CategoryCollectionKey';

export interface CategoryCollection extends Identifiable<CategoryCollectionKey> {
  readonly scripting: IScriptingDefinition;
  readonly os: OperatingSystem;
  readonly totalScripts: number;
  readonly totalCategories: number;
  readonly actions: ReadonlyArray<Category>;

  getScriptsByLevel(level: RecommendationLevel): ReadonlyArray<Script>;
  getCategory(categoryId: ExecutableId): Category;
  getScript(scriptId: ExecutableId): Script;
  getAllScripts(): ReadonlyArray<Script>;
  getAllCategories(): ReadonlyArray<Category>;
}
