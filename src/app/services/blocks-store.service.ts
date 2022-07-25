import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { FsFile } from '@firestitch/file';
import { guid } from '@firestitch/common';

import { BlockType } from '../enums/block-type.enum';
import { Block } from '../interfaces/block';
import { BlockEditorConfig } from '../interfaces/block-editor-config';


enum EventType {
  Add = 'add',
  Change = 'change',
  Remove = 'remove',
}

@Injectable()
export class BlocksStore implements OnDestroy {

  private _config: BlockEditorConfig;
  private _lastTabIndex = -1;

  private _eventBus$ = new Subject<{ type: string; value: Block }>();
  private _blocks$ = new BehaviorSubject<Block[]>([]);
  private _destroy$ = new Subject<void>();

  public get blocks(): Block[] {
    return [
      ...this._blocks$.getValue(),
    ];
  }

  public get blocks$(): Observable<Block[]> {
    return this._blocks$.asObservable();
  }

  public get blockAdded$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({type}) => type === EventType.Add),
        map(({value}) => value),
      );
  }

  public get blockChanged$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({type}) => type === EventType.Change),
        map(({value}) => value),
      );
  }

  public get blockRemoved$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({type}) => type === EventType.Remove),
        map(({value}) => value),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public init(config: BlockEditorConfig): void {
    this._config = config;
    this._setBlocks(this._config.blocks);
  }

  public blockExists(block: Block) {
    const index = this.blocks.findIndex((b) => {
      return b.guid === block.guid;
    });

    return index !== -1;
  }

  public blockAdd(block: Block, initBlock = false): void {
    if (!this._config.blockAdd) {
      console.warn('[BlockEditor] Config "blockAdd" is not defined');

      return;
    }

    if (initBlock) {
      block = this._createBlock(block);
    }

    this._config.blockAdd(block)
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((newBlock: Block) => {
        this._appendBlock(newBlock);
      });
  }

  public blockUpload(block: Block, fsFile: FsFile, initBlock = false): void {
    if (!this._config.blockUpload) {
      console.warn('[BlockEditor] Config "blockUpload" is not defined');

      return;
    }

    if (initBlock) {
      block = this._createBlock(block);
    }

    this._config.blockUpload(block, fsFile.file)
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((newBlock: Block) => {
        this._appendBlock(newBlock);
      });
  }

  public blockChange(block: Block): void {
    if (this._config.blockChanged) {
      this._config.blockChanged(block);
    }

    this._dispatchEvent(EventType.Change, block);
  }

  public blockRemove(targetBlocks: Block | Block[]): void {
    const blocks = this.blocks;

    if (!Array.isArray(targetBlocks)) {
      targetBlocks = [targetBlocks];
    }

    targetBlocks.forEach((block) => {
      const index = blocks
        .findIndex((b) => b.guid === block.guid);

      if (index !== -1) {
        blocks.splice(index, 1);

        this._dispatchEvent(EventType.Remove, block);
      }
    });

    this._setBlocks(blocks);
  }

  public isReordableBlock(block: Block) {
    return [
      BlockType.LongText,
      BlockType.ShortText,
      BlockType.RadioButton,
      BlockType.Checkbox,
      BlockType.Date,
      BlockType.Signature,
    ].indexOf(block.type) > -1
  }

  public updateTabIndex(index: number) {
    this._lastTabIndex = index;
  }

  private _setBlocks(blocks: Block[]): void {
    this._blocks$.next([...blocks]);

    blocks
      .filter((b) => this.isReordableBlock(b))
      .forEach((b) => {
        this._lastTabIndex = Math.max(b.tabIndex, this._lastTabIndex);
      });
  }

  private _appendBlock(block: Block) {
    const blocks = [
        ...this.blocks,
        block,
      ];

    this._deduplicateIndexesFor(blocks);
    this._setBlocks(blocks);

    this._dispatchEvent(EventType.Add, block);
  }

  private _dispatchEvent(type: EventType, value: Block): void {
    this._eventBus$.next({
      type,
      value,
    });
  }

  private _createBlock(block: Block) {
    const newBlock = {
      shapeBottomLeft: 'round',
      shapeTopLeft: 'round',
      shapeTopRight: 'round',
      shapeBottomRight: 'round',
      verticalAlign: 'top',
      horizontalAlign: 'left',
      ...block,
      guid: block.guid || guid('xxxxxxxxxxxx'),
    };

    let width: any = (this._config.width * .333).toFixed(2);
    let height: any = width / 2;

    if (newBlock.type === BlockType.Rectangle) {
      newBlock.borderColor = '#cccccc';
      newBlock.borderWidth = 1;
    } else if (newBlock.type === BlockType.Checkbox || newBlock.type === BlockType.RadioButton) {
      width = .25;
      height = .25;
      newBlock.keepRatio = true;
    } else {
      width = 2;
      height = .5;
    }

    if (this.isReordableBlock(newBlock)) {
      newBlock.tabIndex = this._lastTabIndex + 1;

      this.updateTabIndex(newBlock.tabIndex);
    }

    return {
      top:  height,
      left:  width,
      width,
      height,
      ...newBlock,
    };
  }

  private _deduplicateIndexesFor(blocks: Block<unknown>[]): void {
    blocks.forEach((block, index) => {
      block.index = index;
    });
  }
}
