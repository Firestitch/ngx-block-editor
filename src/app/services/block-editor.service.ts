import { Injectable, OnDestroy } from '@angular/core';


import { guid } from '@firestitch/common';
import { FsDialog } from '@firestitch/dialog';
import { FsFile } from '@firestitch/file';
import { FsPrompt } from '@firestitch/prompt';

import { BehaviorSubject, Observable, Subject, from, throwError } from 'rxjs';
import {
  debounceTime, filter, groupBy, map, mapTo, mergeAll, switchMap, takeUntil, tap,
} from 'rxjs/operators';

import { FsBlockComponent } from '../components/block';
import { LayersReorderDialogComponent } from '../components/layers-reorder-dialog';
import { BlockType } from '../enums';
import { BlockEditorConfig, BlockGroup } from '../interfaces';

import { Block } from './../interfaces/block';
import { BlocksStore } from './blocks-store.service';


@Injectable()
export class BlockEditorService implements OnDestroy {

  public container;
  public margin;
  public config: BlockEditorConfig;
  public blockGroups: BlockGroup[] = [];

  private _selectedBlocks$ = new BehaviorSubject<Block[]>([]);
  private _blockComponents$ = new BehaviorSubject<FsBlockComponent[]>([]);
  private _blockClippable$ = new BehaviorSubject<boolean>(null);
  private _destroy$ = new Subject();
  private _selectionRange;

  constructor(
    private _store: BlocksStore,
    private _dialog: FsDialog,
    private _prompt: FsPrompt,
  ) { }

  public get blockComponents$(): Observable<FsBlockComponent[]> {
    return this._blockComponents$.asObservable();
  }

  public set blockComponents(blockComponents) {
    this._blockComponents$.next(blockComponents);
  }

  public init(config: BlockEditorConfig) {
    this.config = config;
    this._store.init(config.blocks);
    this._initBlockGroups();
    this._initBlockChange();
  }

  public blockAdd(block: Block) {
    if (!this.config.blockAdd) {
      console.warn('[BlockEditor] Config "blockAdd" is not defined');

      return;
    }

    block = this._initBlock(block);

    this.config.blockAdd(block)
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((newBlock: Block) => {
        this._store.blockAdd(newBlock);
      });
  }

  public blockUpload(block: Block, fsFile: FsFile): Observable<Block> {
    if (!this.config.blockUpload) {
      return throwError('[BlockEditor] Config "blockUpload" is not defined');
    }

    const existing = this._store.blockExists(block);

    if (!existing) {
      block = this._initBlock(block);
    }

    return from(fsFile.imageInfo)
      .pipe(
        switchMap((imageInfo) => {
          if (!existing && imageInfo?.height && imageInfo?.width) {
            const ratio = imageInfo.height / imageInfo.width;
            block.width = this.config.width * .4;
            block.height = block.width * ratio;
          }

          return this.config.blockUpload(block, fsFile.file);
        }),
        tap((newBlock) => {
          if (existing) {
            this._store.blockUpdate({
              ...block,
              ...newBlock,
            });

          } else {
            this.blockAdd(newBlock);
          }
        }),
        takeUntil(this._destroy$),
      );
  }

  public blockRemove(block: Block) {
    this._store.blockRemove(block);
  }

  public get blocks$(): Observable<Block[]> {
    return this._store.blocks$;
  }

  public get blockChanged$() {
    return this._store.blockChanged$;
  }

  public get blockUpdated$() {
    return this._store.blockUpdated$;
  }

  public get blockClippable$() {
    return this._blockClippable$.asObservable();
  }

  public set blockClippable(value) {
    this._blockClippable$.next(value);
  }

  public get blockAdded$(): Observable<Block> {
    return this._store.blockAdded$;
  }

  public get blockRemoved$(): Observable<Block> {
    return this._store.blockRemoved$;
  }

  public get blocks(): Block[] {
    return this._store.blocks;
  }

  public blockChange(block: Block): void {
    this._store.blockChange(block);
  }

  public applyBlockGroup(block: Block, blockGroup: BlockGroup): void {
    block.name = blockGroup?.name;
    block.description = blockGroup?.description;
    block.label = blockGroup?.label;
    this.blockChange(block);
  }

  public isSelectedBlock(block: Block) {
    return this.selectedBlocks.indexOf(block) !== -1;
  }

  public indexOf(block) {
    return this.blocks.map((e) => e.guid).indexOf(block.guid);
  }

  public selectedBlockComponentChangeProperty(values: { [key: string]: any }) {
    this.selectedBlocks
      .forEach((block: Block) => {
        Object.keys(values)
          .forEach((name) => {
            block[name] = values[name];
          });
        this.blockChange(block);
      });
  }

  public blockGroupChangeProperty(blockGroup, values) {
    this.blocks
      .filter((block) => block.name === blockGroup.name)
      .forEach((block: Block) => {
        Object.keys(values)
          .forEach((name) => {
            block[name] = values[name];
          });

        this.blockChange(block);
      });
  }

  public get selectedBlocks$(): Observable<Block[]> {
    return this._selectedBlocks$;
  }

  public set selectedBlock(block: Block) {
    this.selectedBlocks = [block];
  }

  public set selectedBlocks(blocks: Block[]) {
    this._selectedBlocks$.next(blocks);

    if (this.config.blocksSelect) {
      this.config.blocksSelect(blocks);
    }
  }

  public get selectedBlocks(): Block[] {
    return this._selectedBlocks$.getValue();
  }

  public saveSelection(): void {
    const selection: any = window.getSelection();
    this._selectionRange = selection.getRangeAt(0);
  }

  public restoreSelection(): void {
    if (this._selectionRange) {
      const selection: any = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this._selectionRange);
    }
  }

  public hasSelectionRange(): boolean {
    return this._selectionRange && (this._selectionRange.baseOffset - this._selectionRange.focusOffset) > 0;
  }

  public registerContainer(container) {
    this.container = container;
  }

  public registerMargin(margin) {
    this.margin = margin;
  }

  public removeBlocks(blocks: Block[]) {
    this._prompt.confirm({
      title: 'Confirm',
      template: 'Are you sure your would like to delete this block?',
    })
      .pipe(
        switchMap(() => this.config.blocksRemove ? this.config.blocksRemove(blocks) : throwError('config.blocksRemove is not configured')),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        blocks.forEach((block) => {
          this.blockRemove(block);
        });
        this.selectedBlocks = [];
      });
  }

  public openReorderDialog(): void {
    const blocks = this.blocks
      .sort((blockA: Block, blockB: Block) => (blockA.index - blockB.index))
      .reverse();

    this._dialog
      .open(
        LayersReorderDialogComponent,
        {
          data: {
            blocks,
          },
        },
      )
      .afterClosed()
      .pipe(
        filter((b) => !!b),
        switchMap((b) => this.config.blocksReorder(b)
          .pipe(
            mapTo(blocks),
          ),
        ),
        takeUntil(this._destroy$),
      )
      .subscribe((b: Block[]) => {
        b
          .forEach((block, index) => {
            block.index = index;
          });
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  private _initBlockGroups(): void {
    this.blockGroups = Object.values(
      this._store.blocks
        .reduce((accum: { [key: string]: BlockGroup }, block) => {
          if (block.name) {
            const existing = accum[block.name] || {};
            accum[block.name] = {
              label: block.label || existing.label,
              description: block.description || existing.description,
              name: block.name,
            };
          }

          return accum;
        }, {}),
    );
  }

  private _initBlockChange(): void {
    if (this.config.blockChange) {
      this.blockChanged$
        .pipe(
          groupBy((block) => (block.guid)),
          map((group) => group.pipe(
            debounceTime(250),
          )),
          mergeAll(),
        )
        .subscribe((block) => {
          this.config.blockChange(block);
        });
    }
  }

  private _initBlock(block: Block): Block {
    let newBlock = {
      ...block,
      shapeBottomLeft: block.shapeBottomLeft ?? 'round',
      shapeTopLeft: block.shapeTopLeft ?? 'round',
      shapeTopRight: block.shapeTopRight ?? 'round',
      shapeBottomRight: block.shapeBottomRight ?? 'round',
      verticalAlign: block.verticalAlign ?? 'top',
      horizontalAlign: block.horizontalAlign ?? 'left',
      index: block.guid ? block.index : this._store.blocks.length,
      guid: block.guid || guid('xxxxxxxxxxxx'),
      keepRatio: block.keepRatio ?? [
        BlockType.Checkbox,
        BlockType.RadioButton,
        BlockType.Pdf,
      ]
        .indexOf(block.type) !== -1,
    };

    let width: any = (this.config.width * .333).toFixed(2);
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

    //get max tabindex
    // newBlock.tabIndex = this._lastTabIndex + 1;
    // this.updateTabIndex(newBlock.tabIndex);

    return {
      top: height,
      left: width,
      width,
      height,
      ...newBlock,
    };
  }

}
