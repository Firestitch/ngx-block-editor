import {
  ChangeDetectionStrategy, Component,
  ContentChildren, ElementRef, Input,
  OnDestroy, OnInit, QueryList, ViewChild, 
} from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';
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

  public blocks: Block<any>[];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
  ) {}

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this.config = {
      ...this.config,
      unit: 'in',
    };

    this._blockEditor.blocks = this.config.blocks;
    this._blockEditor.config = this.config;
    this._blockEditor.blocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks) => {
        this.blocks = blocks;
      });

    setTimeout(() => {
      this.zoomCenter();
    });
  }

  public zoomCenter(): void {
    this.zoompan.center(this.artboard.nativeElement, { vertical: false });
  }

  public editorContainerClick(event): void {
    if (
      event.target.classList.contains('deselectable') ||
      event.target.classList.contains('fs-zoom-pan-container') 
    ) {
      this.zoompan.enable();
      this._blockEditor.selectedBlocks = [];
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
