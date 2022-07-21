import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, Input,
  IterableDiffer,
  IterableDiffers,
  OnDestroy, OnInit, QueryList, ViewChild, ViewChildren,
} from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { fromEvent, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { FsBlockComponent } from '../block/block.component';
import { BlockEditorService } from '../../services/block-editor.service';
import { Block } from '../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';
import { FsBlockEditorMarginDirective } from '../../directives/block-editor-margin.directive';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-artboard',
  templateUrl: 'artboard.component.html',
  styleUrls: [ 'artboard.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtboardComponent implements OnInit, AfterViewInit, OnDestroy {

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

  @ViewChild(SidebarComponent, { static: true })
  public sidebar: SidebarComponent;

  @Input() public config: BlockEditorConfig;
  @Input() public zoompan: FsZoomPanComponent;

  public blocks: Block[] = [];

  private _differ: IterableDiffer<FsBlockComponent>;
  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
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

    this._blockEditor.registerContainer(this.artboard.nativeElement);
    this._blockEditor.registerMargin(this.marginContainer.nativeElement);

    this._blockEditor.blocks$
    .pipe(
      takeUntil(this._destroy$),
    )
    .subscribe((blocks) => {
      this.blocks = blocks;
      this._cdRef.markForCheck();
    });

    this._blockEditor.blockAdded$
    .pipe(
      delay(300),
      takeUntil(this._destroy$),
    )
    .subscribe((block) => {
      this._blockEditor.selectedBlocks = [block];

      this._cdRef.markForCheck();
    });

    fromEvent(window, 'keydown')
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((event: any) => {
        event.preventDefault();
        const inchPixel = 1 / 100;

        this._blockEditor.selectedComponentBlocks
          .forEach((blockComponent: FsBlockComponent) => {
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

  public blockChanged(block: Block<any>): void {
    if (this.config.blockChanged) {
      this.config.blockChanged(block);
    }
  }

  public ngAfterViewInit(): void {
    // this.blockComponents.changes
    // .pipe(
    //   takeUntil(this._destroy$),
    // )
    // .subscribe((changes) => {
    //   const changeDiff = this._differ.diff(changes);
    //   if (changeDiff) {
    //     changeDiff.forEachAddedItem((change) => {
    //       //this.blockAdded.emit(change.item);
    //     });

    //     changeDiff.forEachRemovedItem((change) => {
    //       //this.blockRemoved.emit(change.item);
    //     });
    //   }
    // });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
