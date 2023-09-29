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
  defaultValidation?: (block: Block, value: any) => Observable<any>;
  blockChanged?: (block: Block) => void;
  blockAdd?: (block: Block) => Observable<Block>;
  blockUpload?: (block: Block, file: Blob) => Observable<Block>;
  blocksRemove?: (block: Block[]) => Observable<any>;
  blocksLevelChanged?: (blocks: Block[]) => void;
  blocksSelected?: (blocks: Block[]) => void;
  blocksReordered?: (blocks: Block[]) => Observable<any>;
}
