import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, Input,
  IterableDiffer,
  IterableDiffers,
  OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren,
} from '@angular/core';

import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { FsBlockComponent } from './../block/block.component';
import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';
import { FsBlockEditorMarginDirective } from './../../directives/block-editor-margin.directive';
import { SidebarComponent } from './../sidebar/sidebar.component';

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

  @ViewChild('marginContainer', { static: true })
  public marginContainer: ElementRef;

  @ViewChildren(FsBlockEditorMarginDirective)
  public margins: QueryList<FsBlockEditorMarginDirective>;

  @ViewChild('artboardContainer', { static: true })
  public artboardContainer: ElementRef;

  @ViewChild(SidebarComponent, { static: true })
  public sidebar: SidebarComponent;

  @Input() public config: BlockEditorConfig;

  @Output() blockAdded = new EventEmitter<FsBlockComponent>();
  @Output() blockRemoved = new EventEmitter<FsBlockComponent>();

  public blocks: Block<any>[];

  private _differ: IterableDiffer<FsBlockComponent>;
  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _service: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
    private _differs: IterableDiffers,
  ) {
    this._differ = _differs.find([]).create(null);
  }

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this.config = {
      ...this.config,
      unit: 'in',
    };

    this._service.registerContainer(this.artboard.nativeElement);
    this._service.registerMargin(this.marginContainer.nativeElement);

    this._service.blocks = this.config.blocks;
    this._service.config = this.config;
    this._service.blocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks) => {
        this.blocks = blocks;
      });

    fromEvent(window, 'keydown')
      .pipe(
        takeUntil(this._destroy$),
        filter((event: KeyboardEvent) => {
          return !!event.key.match(/^Arrow/) && !!this._service.selectedBlockComponents.length;
        }),
      )
      .subscribe((event: any) => {
        event.preventDefault();
        const inchPixel = 1 / 100;
        this._service.selectedBlockComponents.forEach((blockComponent) => {
          switch (event.key) {
            case 'ArrowUp':
              blockComponent.top = blockComponent.block.top - inchPixel;
              break;
            case 'ArrowDown':
              blockComponent.top = blockComponent.block.top + inchPixel;
              break;
            case 'ArrowLeft':
              blockComponent.left = blockComponent.block.left - inchPixel;
              break;
            case 'ArrowRight':
              blockComponent.left = blockComponent.block.left + inchPixel;
              break;
          }
        });
      });
  }

  public artboardClick(event): void {
    if (
      event.target.isSameNode(this.artboard.nativeElement) ||
      event.target.isSameNode(this.artboardContainer.nativeElement)
    ) {
      this._service.selectedBlockComponents.forEach((block) => {
        block.deselect();
        block.markForCheck();
      });

      this._service.selectedBlockComponents = [];
    }
  }

  public blockChanged(block: Block<any>): void {
    this.sidebar.changeDetector.markForCheck();
    if (this.config.blockChanged) {
      this.config.blockChanged(block);
    }
  }

  public ngAfterViewInit(): void {
    this.blockComponents.changes.subscribe((changes) => {
      const changeDiff = this._differ.diff(changes);
      if (changeDiff) {
        changeDiff.forEachAddedItem((change) => {
          this.blockAdded.emit(change.item);
        });

        changeDiff.forEachRemovedItem((change) => {
          this.blockRemoved.emit(change.item);
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
