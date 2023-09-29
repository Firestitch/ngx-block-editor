import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, mapTo, switchMap, takeUntil } from 'rxjs/operators';

import { FsDialog } from '@firestitch/dialog';
import { FsFile } from '@firestitch/file';

import { FsBlockComponent } from '../components/block/block.component';
import { LayersReorderDialogComponent } from '../components/layers-reorder-dialog/layers-reorder-dialog.component';
import { BlockEditorConfig } from '../interfaces/block-editor-config';
import { Block } from './../interfaces/block';
import { BlocksStore } from './blocks-store.service';


@Injectable()
export class BlockEditorService implements OnDestroy {

  public container;
  public margin;
  public config: BlockEditorConfig;

  private _selectedBlocks$ = new BehaviorSubject<Block[]>([]);
  private _selectionRange;
  private _blockComponents = new Map<Block, FsBlockComponent>();
  private _blockClippable$ = new BehaviorSubject<boolean>(null);
  private _destroy$ = new Subject();
  private _blockInited$ = new Subject<Block>();

  constructor(
    private _store: BlocksStore,
    private _dialog: FsDialog,
  ) { }

  public get blockComponents(): FsBlockComponent[] {
    return Array.from(this._blockComponents.values());
  }

  public init(config: BlockEditorConfig) {
    this.config = config;
    this._store.init({ ...this.config });
  }

  public blockAdd(block: Block) {
    this._store.blockAdd(block);
  }

  public blockUpload(block: Block, fsFile: FsFile): Observable<Block> {
    return this._store.blockUpload(block, fsFile);
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

  public get blockUpdated$() {
    return this._store.blockUpdated$;
  }

  public get blockClippable$() {
    return this._blockClippable$;
  }

  public set blockClippable(value) {
    this._blockClippable$.next(value);
  }

  public get blockAdded$(): Observable<Block> {
    return this._store.blockAdded$;
  }

  public get blockInited$(): Observable<Block> {
    return this._blockInited$;
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

  public isSelectedBlock(block: Block) {
    return this.selectedBlocks.indexOf(block) !== -1;
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

  public initBlock(block: Block, blockComponent: FsBlockComponent) {
    this._blockComponents.set(block, blockComponent);
    this._blockInited$.next(block);
  }

  public destroyBlock(block: Block) {
    this._blockComponents.delete(block);
  }

  public registerContainer(container) {
    this.container = container;
  }

  public registerMargin(margin) {
    this.margin = margin;
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
          }
        },
      )
      .afterClosed()
      .pipe(
        filter((blocks) => !!blocks),
        switchMap((blocks) => this.config.blocksReorder(blocks)
          .pipe(
            mapTo(blocks),
          )
        ),
        takeUntil(this._destroy$),
      )
      .subscribe((blocks: Block[]) => {
        blocks
          .forEach((block, index) => {
            block.index = index;
            this._store.updateTabIndex(index);
          });
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
