import { FsBlockComponent } from './../block/block.component';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, Input,
  OnDestroy, OnInit, QueryList,
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { FsFile } from '@firestitch/file';
import { guid } from '@firestitch/common';

import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService } from '../../services/block-editor.service';
import { Block } from '../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';

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
  @Input() public blockAdded: EventEmitter<FsBlockComponent>;

  public block: Block<any>;
  public clippable;

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _service: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
  ) { }

  public get changeDetector(): ChangeDetectorRef {
    return this._cdRef;
  }

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this._service.selectedBlockComponents$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks: FsBlockComponent[]) => {
        this.clippable = false;
        this.block = blocks[0] ? blocks[0].block : null;
        this.changeDetector.markForCheck();

        if (this.config.blocksSelected) {
          this.config.blocksSelected(blocks.map((block) => block.block));
        }
      });
  }

  public verticalAlignClick(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.verticalAlign = value;
    });
  }

  public boldClick(): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.bold = !block.bold;
    });
  }

  public fontColorChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.fontColor = value;
    });
  }

  public lineHeightChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.lineHeight = value || null;
      }
    });
  }

  public fontSizeChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.fontSize = value || null;
      }
    });
  }

  public borderWidthChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.borderWidth = value || null;
      }
    });
  }

  public italicClick(): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.italic = !block.italic;
    });
  }

  public underlineClick(): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.underline = !block.underline;
    });
  }

  public backgroundColorChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.backgroundColor = value;
    });
  }

  public widthChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.width = value;
      }
    });
  }

  public heightChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.height = value;
      }
    });
  }

  public topChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.top = value;
      }
    });
  }

  public leftChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.left = value;
      }
    });
  }

  public rotateChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.rotate = value;
      }
    });
  }

  public paddingChange(name, value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.padding(name, value || null);
      }
    });
  }

  public paddingAllChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.paddingAll = value;
      }
    });
  }

  public borderColorChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.borderColor = value;
    });
  }

  public horizontalAlignClick(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.horizontalAlign = value;
    });
  }

  public shapeRound(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.shapeRound(value, block.block[value] === 'round' ? 'square' : 'round');
    });
  }

  public imageRemove(): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.imageUrl = null;
    });
  }

  public imageClip(): void {
    this.clippable = !this.clippable;
    this._service.selectedBlockComponents.forEach((block) => {
      block.clippable = this.clippable;
    });
  }

  public shapeRadiusChange(value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      block.shapeRadius = value;
    });
  }

  public fileSelect(fsFile: FsFile): void {
    if (this.config.fileUpload) {
      this.config.fileUpload(fsFile.file)
        .subscribe((value) => {
          this._service.selectedBlockComponents.forEach((block) => {
            block.imageUrl = value;
          });
        });
    }
  }

  public blockRemoveClick() {

    if (this.config.blocksRemoved) {
      this.config.blocksRemoved(this._service.selectedBlocks)
        .pipe(
          takeUntil(this._destroy$),
        )
        .subscribe(() => {
          this._service.selectedBlocks.forEach((block) => {
            this._service.removeBlock(block);
          });

          this._service.selectedBlockComponents = [];
        });
    }
  }

  public blockAddClick() {
    const width = (this.config.width * .333).toFixed(2);
    const height = (this.config.height * .333).toFixed(2);
    const reference = guid();
    const block: Block<any> = {
      type: 'text',
      reference,
      top:  height,
      left:  width,
      width: width,
      height: height,
    };

    if (this.config.blockAdded) {
      this.config.blockAdded(block)
        .pipe(
          takeUntil(this._destroy$),
        )
        .subscribe((block) => {
          this.addBlock(block);
          this.changeDetector.markForCheck();

          this.blockAdded
            .pipe(
              take(1),
              takeUntil(this._destroy$),
            )
            .subscribe((blockComponent: FsBlockComponent) => {
              this._service.selectedBlockComponents = [blockComponent];
            });
        });
    }
  }

  public addBlock(block: Block<any>): void {
    this._service.addBlock(block);
    this._updateIndexes();
  }

  private _updateIndexes(): void {

    const sort = this.blocks.slice().sort((a, b) => {
      return a.index > b.index ? 1 : -1;
    })

    sort.forEach((block, index) => {
      this.blocks.find((item) => {
        return block.reference === item.reference;
      }).index = index;
    });
  }

  public layerMove(direction): void {
    this._service.blockComponents.forEach((blockComponent) => {
      if (this._service.isSelectedBlock(blockComponent)) {
        blockComponent.block.index + (999 * direction);
      }
    });

    const sorted = this._service.blockComponents.sort((a, b) => {
      return a.index > b.index ? 1 : -1;
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

  public getBlock(reference: any): Block<any> {
    return this._service.blocks.find((block) => {
      return block.reference === reference;
    });
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
