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
  blocks?: Block<any>[],
  blockChanged?: (block: Block<any>) => void;
  blockAdded?: (block: Block<any>) => Observable<Block<any>>;
  blocksRemoved?: (block: Block<any>[]) => Observable<Block<any>>;
  blocksLevelChanged?: (blocks: Block<any>[]) => void;
  blocksSelected?: (blocks: Block<any>[]) => void;
  fileUpload?: (file: Blob) => Observable<string>;
}
