import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, Input,
  OnDestroy, OnInit, QueryList, ViewChild, ViewChildren,
} from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

import { FsBlockEditorMarginDirective } from '../../directives/block-editor-margin.directive';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';
import { Block } from '../../interfaces/block';
import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService } from '../../services/block-editor.service';
import { FsBlockComponent } from '../block/block.component';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-artboard',
  templateUrl: 'artboard.component.html',
  styleUrls: ['artboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtboardComponent implements OnInit, OnDestroy {

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

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
  ) { }

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
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
