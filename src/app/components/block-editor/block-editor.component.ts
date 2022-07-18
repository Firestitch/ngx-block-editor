import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, Input,
  OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren,
} from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { FsBlockComponent } from './../block/block.component';
import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';
import { FsBlockEditorMarginDirective } from './../../directives/block-editor-margin.directive';
import { SidebarComponent } from './../sidebar/sidebar.component';
import { ArtboardComponent } from '../artboard/artboard.component';


@Component({
  selector: 'fs-block-editor',
  templateUrl: 'block-editor.component.html',
  styleUrls: [ 'block-editor.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    BlockEditorService,
  ]
})
export class FsBlockEditorComponent implements OnInit, OnDestroy {

  @ContentChildren(FsBlockEditorSidebarPanelDirective)
  public sidebarPanels: QueryList<FsBlockEditorSidebarPanelDirective>;

  @ViewChild(FsZoomPanComponent, { static: true })
  public zoompan: FsZoomPanComponent;

  @ViewChild('artboardContainer', { static: true })
  public artboardContainer: ElementRef;

  @ViewChild(SidebarComponent, { static: true })
  public sidebar: SidebarComponent;

  @ViewChild(ArtboardComponent, { read: ElementRef })
  public artboard: ElementRef;

  @Input() public config: BlockEditorConfig;

  @Output() blockAdded = new EventEmitter<FsBlockComponent>();
  @Output() blockRemoved = new EventEmitter<FsBlockComponent>();

  public blocks: Block<any>[];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _service: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this.config = {
      ...this.config,
      unit: 'in',
    };

    this._service.blocks = this.config.blocks;
    this._service.config = this.config;
    this._service.blocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks) => {
        this.blocks = blocks;
      });
    
  }

  public artboardClick(event): void {
    if (
      event.target.classList.contains('deselectable')
    ) {
      this._service.selectedBlockComponents.forEach((block) => {
        block.deselect();
        this._service.blockChange(block);
      });

      this._service.selectedBlockComponents = [];
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
