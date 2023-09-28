import { Injectable, OnDestroy } from '@angular/core';

import { guid } from '@firestitch/common';
import { FsFile } from '@firestitch/file';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { debounceTime, filter, groupBy, map, mergeAll, switchMap, takeUntil } from 'rxjs/operators';

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

  private _eventBus$ = new Subject<{ type: EventType; value: Block }>();
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
        filter(({ type }) => type === EventType.Add),
        map(({ value }) => value),
      );
  }

  public get blockChanged$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Change),
        map(({ value }) => value),
      );
  }

  public get blockRemoved$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Remove),
        map(({ value }) => value),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public init(config: BlockEditorConfig): void {
    this._config = config;
    this._setBlocks(this._config.blocks);

    if (this._config.blockChanged) {
      this.blockChanged$
        .pipe(
          groupBy((block) => (block.guid)),
          map((group) => group.pipe(
            debounceTime(250),
          )),
          mergeAll(),
        )
        .subscribe((block) => {
          this._config.blockChanged(block);
        });
    }
  }

  public blockExists(block: Block) {
    const index = this.blocks.findIndex((b) => {
      return b.guid === block.guid;
    });

    return index !== -1;
  }

  public blockAdd(block: Block): void {
    if (!this._config.blockAdd) {
      console.warn('[BlockEditor] Config "blockAdd" is not defined');

      return;
    }

    block = this._createBlock(block);

    this._config.blockAdd(block)
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((newBlock: Block) => {
        this._appendBlock(newBlock);
      });
  }

  public blockUpload(block: Block, fsFile: FsFile): void {
    if (!this._config.blockUpload) {
      console.warn('[BlockEditor] Config "blockUpload" is not defined');

      return;
    }

    const existing = this.blockExists(block);

    block = this._createBlock(block);

    from(fsFile.imageInfo)
      .pipe(
        switchMap((imageInfo) => {
          if (!existing && imageInfo?.height && imageInfo?.width) {
            const ratio = imageInfo.height / imageInfo.width;
            block.width = this._config.width * .4;
            block.height = block.width * ratio;
          }

          return this._config.blockUpload(block, fsFile.file);
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((newBlock: Block) => {
        if (existing) {
          this.blockChange(newBlock);
        } else {
          this._appendBlock(newBlock);
        }
      });
  }

  public blockChange(block: Block): void {
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

  public isReordableBlock(block: Block): boolean {
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

  private _createBlock(block: Block): Block {
    let newBlock = {
      ...block,
      shapeBottomLeft: block.shapeBottomLeft ?? 'round',
      shapeTopLeft: block.shapeTopLeft ?? 'round',
      shapeTopRight: block.shapeTopRight ?? 'round',
      shapeBottomRight: block.shapeBottomRight ?? 'round',
      verticalAlign: block.verticalAlign ?? 'top',
      horizontalAlign: block.horizontalAlign ?? 'left',
      guid: block.guid || guid('xxxxxxxxxxxx'),
      keepRatio: block.keepRatio ?? [
        BlockType.Checkbox,
        BlockType.RadioButton,
        BlockType.Pdf,
      ]
        .indexOf(block.type) !== -1
    };

    let width: any = (this._config.width * .333).toFixed(2);
    let height: any = width / 2;

    if (newBlock.type === BlockType.Rectangle) {
      newBlock = {
        ...newBlock,
        borderColor: newBlock.borderColor ?? '#cccccc',
        borderWidth: newBlock.borderWidth ?? 1,
      };
    } else if (newBlock.type === BlockType.Checkbox || newBlock.type === BlockType.RadioButton) {
      width = .25;
      height = .25;
    } else {
      width = 2;
      height = .5;
    }

    if (this.isReordableBlock(newBlock)) {
      newBlock.tabIndex = this._lastTabIndex + 1;
      this.updateTabIndex(newBlock.tabIndex);
    }

    return {
      top: height,
      left: width,
      width,
      height,
      ...newBlock,
    };
  }

  private _deduplicateIndexesFor(blocks: Block[]): void {
    blocks.forEach((block, index) => {
      block.index = index;
    });
  }
}
