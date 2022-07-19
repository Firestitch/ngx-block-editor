import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Block } from './../interfaces/block';
import { FsBlockComponent } from '../components/block/block.component';
import { BlockEditorConfig } from '../interfaces/block-editor-config';
import { takeUntil } from 'rxjs/operators';
import { FsFile } from '@firestitch/file';
import { guid } from '@firestitch/common';

@Injectable()
export class BlockEditorService implements OnDestroy {

  public container;
  public margin;
  public config: BlockEditorConfig;

  private _blockChanged$ = new Subject<Block<any>>();
  private _blockRemoved$ = new Subject<Block<any>>();
  private _blockAdded$ = new Subject<Block<any>>();
  private _blocks$ = new BehaviorSubject<Block[]>([]);
  private _selectedBlocks$ = new BehaviorSubject<Block<any>[]>([]);
  private _selectionRange;
  private _blockComponents = new Map<Block, FsBlockComponent>();
  private _destroy$ = new Subject();

  public get elementGuidelines() {
    return [
      ...Array.from(this._blockComponents.values())
      .map((block) => {
        return block.el;
      }),
      this.container,
      this.margin,
    ];
  }

  public get blockComponents(): FsBlockComponent[] {
    return Array.from(this._blockComponents.values());
  }


  public get selectedComponentBlocks() {
    return this.blockComponents
    .filter((blockComponent) => this.selectedBlocks.indexOf(blockComponent.block) !== -1);
  }
  
  public blockUpload(block: Block, fsFile: FsFile) {
    if (this.config.blockUpload) {
      this.config.blockUpload(block, fsFile.file)
        .pipe(
          takeUntil(this._destroy$),
        )
        .subscribe((block) => {
          this.blocks = [
            ...this.blocks, 
            block,
          ];
          
          this._blockAdded$.next(block);
      
          if(this.config.blockAdded) {
            this.config.blockAdded(block);
          }
          //this._updateIndexes();          
        });
    }
  }

  public blockAdd(block: Block<any>) {
    if (this.config.blockAdd) {
      this.config.blockAdd(block)
        .pipe(
          takeUntil(this._destroy$),
        )
        .subscribe((block) => {
          this.blocks = [
            ...this.blocks, 
            block,
          ];
          
          this._blockAdded$.next(block);
      
          if(this.config.blockAdded) {
            this.config.blockAdded(block);
          }
          //this._updateIndexes();          
        });
    }
  }

  // private _updateIndexes(): void {
  //   const sort = this.blocks.slice().sort((a, b) => {
  //     return a.index > b.index ? 1 : -1;
  //   })

  //   sort.forEach((block, index) => {
  //     this.blocks.find((item) => {
  //       return block.reference === item.reference;
  //     }).index = index;
  //   });
  // }
  
  public removeBlock(block: Block<any>) {
    const index = this.indexOf(block);
    if (index !== -1) {
      const blocks = this.blocks;
      blocks.splice(index, 1);
      this.blocks = blocks;
      this._blockRemoved$.next(block);
    }
  }

  public removeSelectedBlocks() {
    this.selectedBlocks.forEach((block) => {
      this.removeBlock(block);
    });

    this.selectedBlocks = [];
  }

  public get blocks$(): Observable<Block[]> {
    return this._blocks$;
  }

  public get blockChanged$() {
    return this._blockChanged$;
  }

  public get blockRemoved$() {
    return this._blockRemoved$;
  }

  public get blockAdded$() {
    return this._blockAdded$;
  }

  public blockChange(block) {
    this._blockChanged$.next(block);
    if(this.config.blockChanged) {
      this.config.blockChanged(block);
    }
  }

  public get blocks(): Block[] {
    return this._blocks$.getValue();
  }

  public set blocks(blocks) {
    this._blocks$.next(blocks);
  }

  public isSelectedBlock(block: Block) {
    return this.selectedBlocks.indexOf(block) !== -1;
  }

  public indexOf(block) {
    return this.blocks.map((e) => e.reference).indexOf(block.reference);
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

    this.blockComponents.forEach((item: FsBlockComponent) => {

      const blocks = this.elementGuidelines
        .filter((el) => {
          return !el.isSameNode(item.el);
        });

      item.elementGuidelines = blocks;
    });
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

  public sanitizeNewBlock(block) {
    const width = (this.config.width * .333).toFixed(2);
    const height = (this.config.height * .333).toFixed(2);

    return this.sanitizeBlock({
      top:  height,
      left:  width,
      width: height,
      height: width,      
      ...block,
    });
  }

  public sanitizeBlock(block) {
    return {
      shapeBottomLeft: 'round',
      shapeTopLeft: 'round',
      shapeTopRight: 'round',
      shapeBottomRight: 'round',
      verticalAlign: 'top',
      horizontalAlign: 'left',
      ...block,
      guid: block.guid || guid('xxxxxxxxxxxx'),
    };
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
}
