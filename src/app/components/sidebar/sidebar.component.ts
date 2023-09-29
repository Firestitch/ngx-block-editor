import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, Inject, Input,
  OnDestroy, OnInit, Output, QueryList,
} from '@angular/core';

import { Observable, Subject, of } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { index, round } from '@firestitch/common';
import { FsFile } from '@firestitch/file';
import { FsPrompt } from '@firestitch/prompt';

import { FormControl } from '@angular/forms';
import { BlockFormats, BlockTypes } from '../../consts';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';
import { BlockType } from '../../enums';
import { Block } from '../../interfaces/block';
import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService, GoogleFontService } from '../../services';


@Component({
  selector: 'sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss'],
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
  public clippable = false;
  public BlockType = BlockType;
  public blocksReordered: () => void;
  public formats = [];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
    private _prompt: FsPrompt,
    private _googleFontService: GoogleFontService,
    @Inject(DOCUMENT)
    private _document: any,
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


    if (this._blockEditor.config.blocksReorder) {
      this.blocksReordered = () => {
        this._document.defaultView?.scrollTo(0, 0);
        this._blockEditor.openReorderDialog();
      }
    }
  }

  public fontFetch = (value): Observable<any> => {
    return this._googleFontService.getItems();
  }

  public fontDisplayWith = (value): string => {
    return value?.family;
  }

  public fontChanged(font) {
    this._blockEditor.selectedBlockComponentChangeProperty(font?.family, 'fontFamily');
  }

  public verticalAlignClick(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'verticalAlign');
  }

  public boldClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.bold, 'bold');
  }

  public toggleLock(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(!this.block.lock, 'lock');
  }

  public fontColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'fontColor');
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

  public shadowColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, 'shadowColor');
  }

  public paddingAllChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this.block.paddingTop = value;
    this.block.paddingLeft = value;
    this.block.paddingBottom = value;
    this.block.paddingRight = value;

    this._blockEditor.selectedBlocks
      .forEach((block: Block) => {
        this._blockEditor.blockChange(block);
      });
  }

  public paddingKeypress(event: KeyboardEvent, name): void {
    this.block.padding = null;
    this.numericInputKeypress(event, name, 1);
  }

  public paddingAllKeypress(event: KeyboardEvent, unit = 1): void {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      this.block.padding = round(Number(this.block.padding || 0) + ((event.code === 'ArrowDown' ? -1 : 1) * unit), 3);

      this.paddingAllChange(this.block.padding);
    }
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

  public numberChange(value, name): void {
    value = this.validNumeric(value) ? Number(value) : null;
    this._blockEditor.selectedBlockComponentChangeProperty(value, name);
  }

  public imageRemove(): void {
    this._blockEditor.selectedBlockComponentChangeProperty(null, 'imageUrl');
  }

  public imageClip(): void {
    this.clippable = !this.clippable;
    this._blockEditor.blockClippable = true;
  }

  public blockChangeProperty(value, name): void {
    this._blockEditor.selectedBlockComponentChangeProperty(value, name);
  }

  public blockRemoveClick() {
    this._blockEditor.removeBlocks(this._blockEditor.selectedBlocks);
  }

  public validate = (formControl: FormControl) => {
    if (this._blockEditor.config.defaultValidation) {
      return this._blockEditor.config.defaultValidation(this.block, formControl.value);
    }

    return of(true);
  };


  public blockUpload(block: Block, fsFile: FsFile): void {
    this._blockEditor.blockUpload(
      block,
      fsFile,
    )
      .subscribe();
  }

  public blockAdd(type: BlockType): void {
    if (type === BlockType.Pdf || type === BlockType.Image) {
      return;
    }

    const block: Block = {
      type,
      shadowX: 2,
      shadowY: 2,
      shadowBlur: 4,
    };

    this._blockEditor.blockAdd(block);
  }

  public layerMove(direction): void {
    this._blockEditor.blocks.forEach((block) => {
      if (this._blockEditor.isSelectedBlock(block)) {
        block.index += (999 * direction);
      }
    });

    const sorted = this._blockEditor.blocks.sort((a, b) => {
      return a.index > b.index ? 1 : -1;
    });

    sorted.forEach((block, index) => {
      block.index = index;
      this._blockEditor.blockChange(block);
    });

    if (this.config.blocksLevelChanged) {
      this.config.blocksLevelChanged(sorted.map((block) => block));
    }
  }

  public layerUp(): void {
    this.layerMove(1);
  }

  public layerDown(): void {
    this.layerMove(-1);
  }

  public inputFocus(event): void {
    event.target.select();
  }

  public numericInputKeypress(event: KeyboardEvent, name, unit = 1): void {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      this.block[name] = round(Number(this.block[name] || 0) + ((event.code === 'ArrowDown' ? -1 : 1) * unit), 3);

      this._blockEditor.selectedBlockComponentChangeProperty(this.block[name], name);
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public validNumeric(value): boolean {
    return !value || !!String(value).match(/^\d*\.?\d*$/);
  }
}
