import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, Input,
  OnDestroy, OnInit, Output, QueryList,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { FsFile } from '@firestitch/file';
import { FsPrompt } from '@firestitch/prompt';
import { index } from '@firestitch/common';

import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService } from '../../services/block-editor.service';
import { Block } from '../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';
import { BlockType } from '../../enums';
import { BlockTypes, BlockFormats } from '../../consts';


@Component({
  selector: 'sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: [ 'sidebar.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {

  @ContentChildren(FsBlockEditorSidebarPanelDirective)
  public sidebarPanels: QueryList<FsBlockEditorSidebarPanelDirective>;

  @Input() public config: BlockEditorConfig;
  @Input() public blocks;
  
  @Output() public zoomCenter = new EventEmitter();

  public block: Block;
  public BlockTypes = BlockTypes;
  public blockTypeNames = index(BlockTypes, 'value', 'name');
  public blockTypeIcons = index(BlockTypes, 'value', 'icon');
  public clippable;
  public BlockType = BlockType;
  public formats = [];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
    private _prompt: FsPrompt,
  ) { }

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this._blockEditor.selectedBlocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks: Block[]) => {
        this.clippable = false;
        this.block = blocks[0] ? blocks[0] : null;
        this.formats = BlockFormats
          .filter((blockFormat) => (blockFormat.blockTypes.indexOf(this.block?.type) !== -1));
        this._cdRef.markForCheck();
      });

      this._blockEditor.blockChanged$
      .pipe(
        filter((block) => block === this.block),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._cdRef.markForCheck();
      });
  }

  public verticalAlignClick(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'verticalAlign');
  }

  public boldClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.bold, 'bold');
  }

  public fontColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'fontColor');
  }

  public lineHeightChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'lineHeight');
  }

  public fontSizeChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'fontSize');
  }

  public borderWidthChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'borderWidth');
  }

  public italicClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.italic, 'italic');
  }

  public underlineClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.underline, 'underline');
  }

  public backgroundColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'backgroundColor');
  }

  public widthChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'width');
  }

  public heightChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'height');
  }

  public topChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'top');
  }

  public leftChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'left');
  }

  public rotateChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'rotate');
  }

  public paddingChange(name, value): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'padding');
  }

  public paddingAllChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this.block.paddingTop = value;
    this.block.paddingLeft = value;
    this.block.paddingBottom = value;
    this.block.paddingRight = value;

    this.paddingChange('top', value);
    this.paddingChange('left', value);
    this.paddingChange('right', value);
    this.paddingChange('bottom', value);
  }

  public borderColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'borderColor');
  }

  public toggleKeepRatio(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.keepRatio, 'keepRatio');
  }

  public horizontalAlignClick(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'horizontalAlign');
  }

  public shapeRound(name): void {
    const value = this.block[name] === 'round' ? 'square' : 'round';
    this._blockEditor.selectedBlockComponentChangeProperty(value, name);
  }

  public imageRemove(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(null, 'imageUrl');
  }

  public imageClip(): void {
    this.clippable = !this.clippable;
    this._blockEditor.selectedBlockComponentChangeProperty(this.clippable, 'clippable');
  }

  public shapeRadiusChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'shapeRadius');
  }

  public blockChangeProperty(value, name): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, name);
  }

  public imageSelect(fsFile: FsFile): void {
    if (this.config.imageUpload) {
      this.config.imageUpload(fsFile.file)
        .subscribe((value) => {
          this._blockEditor.selectedBlockComponentChangeProperty(value, 'imageUrl');
        });
    }
  }

  public blockRemoveClick() {
    if (this.config.blocksRemove) {
      this._prompt.confirm({
        title: 'Confirm',
        template: 'Are you sure your would like to delete this block?',
      })
      .pipe(
        switchMap(() => this.config.blocksRemove(this._blockEditor.selectedBlocks)),
        takeUntil(this._destroy$),
      )
        .subscribe(() => {
          this._blockEditor.removeSelectedBlocks();
        });
    }
  }

  public blockUpload(blockType, fsFile: FsFile): void {
    const block: Block = this._blockEditor.sanitizeNewBlock({
      type: blockType,
    });

    this._blockEditor.blockUpload(block, fsFile);
  }

  public blockAdd(type: BlockType): void {
    if (type === BlockType.Pdf || type === BlockType.Image) {
      return;
    }

    const block: Block = this._blockEditor.sanitizeNewBlock({
      type,
    });

    this._blockEditor.blockAdd(block);
  }

  public layerMove(direction): void {
    this._blockEditor.blockComponents.forEach((blockComponent) => {
      if (this._blockEditor.isSelectedBlock(blockComponent)) {
        blockComponent.block.index += (999 * direction);
      }
    });

    const sorted = this._blockEditor.blockComponents.sort((a, b) => {
      return a.block.index > b.block.index ? 1 : -1;
    });

    sorted.forEach((item, index) => {
      item.block.index = index;
      item.markForCheck();
    });

    if (this.config.blocksLevelChanged) {
      this.config.blocksLevelChanged(sorted.map((item) => item.block));
    }
  }

  public layerUp(): void {
    this.layerMove(1);
  }

  public layerDown(): void {
    this.layerMove(-1);
  }

  public blockChanged(block: Block<any>): void {
    if (this.config.blockChanged) {
      this.config.blockChanged(block);
    }
  }

  public inputFocus(event): void {
    event.target.select();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public validNumeric(value): boolean {
    return !value || !!String(value).match(/^\d*\.?\d*$/);
  }
}
