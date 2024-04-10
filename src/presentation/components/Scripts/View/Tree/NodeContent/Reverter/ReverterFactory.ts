import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { type NodeMetadata, NodeType } from '../NodeMetadata';
import { getCategoryKey, getScriptKey } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import { ScriptReverter } from './ScriptReverter';
import { CategoryReverter } from './CategoryReverter';
import type { Reverter } from './Reverter';

export function getReverter(
  node: NodeMetadata,
  collection: CategoryCollection,
): Reverter {
  switch (node.type) {
    case NodeType.Category: {
      const categoryKey = getCategoryKey(node.id, collection);
      return new CategoryReverter(categoryKey, collection);
    }
    case NodeType.Script: {
      const scriptKey = getScriptKey(node.id, collection);
      return new ScriptReverter(scriptKey);
    }
    default:
      throw new Error('Unknown script type');
  }
}
