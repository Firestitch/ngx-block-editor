import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, Input, IterableDiffer, IterableDiffers,
  OnDestroy, OnInit, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { FsFile } from '@firestitch/file';
import { guid } from '@firestitch/common';

import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { FsBlockComponent } from './../block/block.component';
import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';

@Component({
  selector: 'fs-block-editor',
  templateUrl: 'block-editor.component.html',
  styleUrls: [ 'block-editor.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    BlockEditorService,
  ]
})
export class FsBlockEditorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ContentChildren(FsBlockEditorSidebarPanelDirective)
  public sidebarPanels: QueryList<FsBlockEditorSidebarPanelDirective>;

  @ViewChildren(FsBlockComponent)
  public blockComponents: QueryList<FsBlockComponent>;

  @ViewChild('artboard', { static: true })
  public artboard: ElementRef;

  @ViewChild('artboardContainer', { static: true })
  public artboardContainer: ElementRef;

  @Input() public config: BlockEditorConfig;

  public block: Block<any>;
  public clippable = false;
  public blocks: Block<any>[];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _service: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
  ) {}

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {

    this.config = {
      ...this.config,
      unit: 'in',
    };

    this._service.registerContainer(this.artboard.nativeElement);
    this._service.config = this.config;
    this._service.blocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks) => {
        this.blocks = blocks;
      });

    this._service.blocks = this.config.blocks;

    this._updateIndexes();

    this._service.selectedBlockComponents$
      .pipe(
        takeUntil(this._destroy$),
    ).subscribe((blocks: FsBlockComponent[]) => {
      this.clippable = false;

      this._service.blockComponents.forEach((block) => {
        block.clippable = false;
      });

      if (blocks[0]) {
        this.block = blocks[0].block;
      } else {
        this.block = null;
      }
      this._cdRef.markForCheck();

      if (this.config.blocksSelected) {
        this.config.blocksSelected(blocks.map((block) => block.block));
      }
    });

    fromEvent(this.artboardContainer.nativeElement, 'mousedown')
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((e: any) => {

        const path = e.path || (e.composedPath && e.composedPath());
        const isBlock = path.some((el) => {
          return el.classList && ['moveable-control', 'block']
            .some((name) => el.classList.contains(name));
        });

        if (!isBlock) {
          this._service.selectedBlockComponents = [];
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

  public paddingChange(name, value): void {
    this._service.selectedBlockComponents.forEach((block) => {
      if (this.validNumeric(value)) {
        block.padding(name, value || null);
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
    this._service.selectedBlocks.forEach((block) => {
      this._service.removeBlock(block);
    });

    if (this.config.blocksRemoved) {
      this.config.blocksRemoved(this._service.selectedBlocks);
    }

    this._service.selectedBlockComponents.forEach((blockComponent) => {
      blockComponent.deselect();
    });
  }

  public blockAddClick() {

    const reference = guid();
    const block: Block<any> = {
      type: 'text',
      reference,
      top: 100,
      left: 100,
      width: 300,
      height: 300,
    };

    this.addBlock(block);

    this.blockComponents.changes
      .pipe(
        take(1),
        takeUntil(this._destroy$),
       )
       .subscribe((queryList: QueryList<FsBlockComponent>) => {
          const blockComponent = queryList.find((item) => {
            return item.block.reference === reference;
          });

         if (blockComponent) {
           blockComponent.transformable = true;
           blockComponent.markForCheck();
            if (this.config.blockAdded) {
              this.config.blockAdded(blockComponent.block);
            }
         }
      });
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

  public trackByBlock(block: Block<any>): string {
    return block.reference;
  }

  public ngAfterViewInit(): void {

    // this.blockComponents.forEach((blockComponent, index) => {
    //   blockComponent.block.index = index;
    // });

    // this.blockComponents.changes
    //   .pipe(
    //     takeUntil(this._destroy$),
    //    )
    //   .subscribe((queryList: QueryList<FsBlockComponent>) => {
    //     queryList.forEach((blockComponent, index) => {
    //       blockComponent.block.index = index;
    //     });
    //   });
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
