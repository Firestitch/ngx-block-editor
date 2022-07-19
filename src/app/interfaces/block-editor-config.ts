import { Observable } from 'rxjs';
import { Block } from './block';

export interface BlockEditorConfig {
  unit?: 'in' | 'px';
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  blocks?: Block[],
  blockChanged?: (block: Block) => void;
  blockAdded?: (block: Block) => void;
  blockAdd?: (block: Block) => Observable<Block>;
  blocksRemove?: (block: Block[]) => Observable<Block>;
  blocksLevelChanged?: (blocks: Block[]) => void;
  blocksSelected?: (blocks: Block[]) => void;
  fileUpload?: (file: Blob) => Observable<string>;
}
