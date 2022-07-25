import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FsFile } from '@firestitch/file';
import { FsDialog } from '@firestitch/dialog';

import { BlocksStore } from './blocks-store.service';
import { LayersReorderDialogComponent } from '../components/layers-reorder-dialog/layers-reorder-dialog.component';
import { Block } from './../interfaces/block';
import { FsBlockComponent } from '../components/block/block.component';
import { BlockEditorConfig } from '../interfaces/block-editor-config';


@Injectable()
export class BlockEditorService implements OnDestroy {

  public container;
  public margin;
  public config: BlockEditorConfig;

  private _selectedBlocks$ = new BehaviorSubject<Block<any>[]>([]);
  private _selectionRange;
  private _blockComponents = new Map<Block, FsBlockComponent>();
  private _destroy$ = new Subject();

  constructor(
    private _store: BlocksStore,
    private _dialog: FsDialog,
  ) {}


  public get blockComponents(): FsBlockComponent[] {
    return Array.from(this._blockComponents.values());
  }


  public get selectedComponentBlocks() {
    return this.blockComponents
    .filter((blockComponent) => this.selectedBlocks.indexOf(blockComponent.block) !== -1);
  }

  public init(config: BlockEditorConfig) {
    this.config = config;
    this._store.init({...this.config});
  }

  public blockAdd(block: Block, newBlock = false) {
    this._store.blockAdd(block, newBlock);
  }

  public blockUpload(block: Block, fsFile: FsFile, newBlock = false) {
    this._store.blockUpload(block, fsFile, false);
  }

  private _updateIndexesFor(blocks: Block<unknown>[]) {
    blocks.forEach((block, index) => {
      block.index = index;
    });

    return blocks;
  }

  public blockRemove(block: Block) {
    this._store.blockRemove(block);
  }

  public removeSelectedBlocks() {
    this.selectedBlocks
      .forEach((block) => {
        this.blockRemove(block);
      });

    this.selectedBlocks = [];
  }

  public get blocks$(): Observable<Block[]> {
    return this._store.blocks$;
  }

  public get blockChanged$() {
    return this._store.blockChanged$;
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

  public isSelectedBlock(block: any) {
    return this.selectedBlocks.indexOf(block.block) !== -1;
  }

  public indexOf(block) {
    return this.blocks.map((e) => e.guid).indexOf(block.guid);
  }

  public selectedBlockComponentChangeProperty(value, name) {
    this.selectedBlocks
      .forEach((block: Block) => {
        block[name] = value;
        this.blockChange(block);
      });

  }

  public get selectedBlocks$(): Observable<Block<any>[]> {
    return this._selectedBlocks$;
  }

  public set selectedBlock(block: Block<any>) {
    this.selectedBlocks = [block];
  }

  public set selectedBlocks(blocks: Block<any>[]) {
    this.blockComponents
    .forEach((blockComponent) => {
      blockComponent.editable = false;
      if(blocks.indexOf(blockComponent.block) !== -1) {
        blockComponent.transformable = true;
      } else {
        blockComponent.deselect();
      }
    });

    this._selectedBlocks$.next(blocks);

    if (this.config.blocksSelected) {
      this.config.blocksSelected(blocks);
    }
  }

  public get selectedBlocks(): Block<any>[] {
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

  public registerBlock(block: Block, blockComponent: FsBlockComponent) {
    this._blockComponents.set(block, blockComponent);
    this.blockComponents.push(block);
  }

  public unregisterBlock(block: Block) {
    this._blockComponents.delete(block);
  }

  public registerContainer(container) {
    this.container = container;
  }

  public registerMargin(margin) {
    this.margin = margin;
  }

  public openReorderDialog(): void {
    const reordableFields = this.blockComponents
      .filter((blockCmp) => {
        return this._store.isReordableBlock(blockCmp.block);
      });

    this._dialog
      .open(
        LayersReorderDialogComponent,
        {
          data: {
            fields: reordableFields,
          }
        },
      )
      .afterClosed()
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((fields: FsBlockComponent[]) => {
        fields.forEach((blockCmp, index) => {
          blockCmp.block.tabIndex = index;

          this._store.blockChange(blockCmp.block);

          this._store.updateTabIndex(index);
        });
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
