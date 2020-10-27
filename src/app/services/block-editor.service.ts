import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Block } from './../interfaces/block';
import { FsBlockComponent } from '../components/block/block.component';
import { BlockEditorConfig } from '../interfaces/block-editor-config';

@Injectable()
export class BlockEditorService {

  public container;
  public margin;
  public blockComponents: FsBlockComponent[] = [];
  public config: BlockEditorConfig;

  private _blocks$ = new BehaviorSubject<Block<any>[]>([]);
  private _selectionRange;
  private _selectedBlockComponents$ = new BehaviorSubject<FsBlockComponent[]>([]);

  constructor() {}

  public get elementGuidelines() {
    return [
      ...this.blockComponents.map((block) => {
        return block.el;
      }),
      this.container,
      this.margin,
    ];
  }

  public addBlock(block: Block<any>) {
    this.blocks$.next([...this.blocks, this.sanitizeBlock(block)]);
  }

  public removeBlock(block: Block<any>) {
    const index = this.indexOf(block);
    if (index !== -1) {
      this.blocks.splice(index, 1);
      this.blocks$.next(this.blocks);
    }
  }

  public get blocks$() {
    return this._blocks$;
  }

  public get blocks() {
    return this.blocks$.getValue();
  }

  public set blocks(blocks) {
    this._blocks$.next(blocks);
  }

  public isSelectedBlock(block) {
    return this.selectedBlockComponents.indexOf(block) !== -1;
  }

  public indexOf(block) {
    return this.blocks.map((e) => e.reference).indexOf(block.reference);
  }

  public set selectedBlockComponents(blocks) {
    this.blockComponents.forEach((block) => {
      block.editable = false;
      block.transformable = blocks.indexOf(block) !== -1;
    });
    this._selectedBlockComponents$.next(blocks);
  }

  public get selectedBlockComponents(): FsBlockComponent[] {
    return this._selectedBlockComponents$.getValue();
  }

  public get selectedBlocks(): Block<any>[] {
    return this.selectedBlockComponents.map((blockComponent) => blockComponent.block);
  }

  public get selectedBlockComponents$() {
    return this._selectedBlockComponents$;
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

  public registerBlock(block: FsBlockComponent) {

    this.blockComponents.push(block);

    this.blockComponents.forEach((item: FsBlockComponent) => {

      const blocks = this.elementGuidelines
        .filter((el) => {
          return !el.isSameNode(item.el);
        });

      item.elementGuidelines = blocks;
    });
  }

  public registerContainer(container) {
    this.container = container;
  }

  public registerMargin(margin) {
    this.margin = margin;
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
    };
  }

}
