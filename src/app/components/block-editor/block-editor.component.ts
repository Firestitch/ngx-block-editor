import { ChangeDetectionStrategy, Component, ContentChildren, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, inject } from '@angular/core';

import { FsZoomPanComponent, FsZoomPanModule } from '@firestitch/zoom-pan';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BlocksStore } from '../../services/blocks-store.service';
import { ArtboardComponent } from '../artboard/artboard.component';

import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';
import { Block } from './../../interfaces/block';
import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { BlockEditorService } from './../../services/block-editor.service';
import { SidebarComponent } from './../sidebar/sidebar.component';
import { SidebarComponent as SidebarComponent_1 } from '../sidebar/sidebar.component';


@Component({
    selector: 'fs-block-editor',
    templateUrl: './block-editor.component.html',
    styleUrls: ['./block-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        BlockEditorService,
        BlocksStore,
    ],
    standalone: true,
    imports: [
        FsZoomPanModule,
        ArtboardComponent,
        SidebarComponent_1,
    ],
})
export class FsBlockEditorComponent implements OnInit, OnDestroy {
  private _el = inject(ElementRef);
  private _blockEditor = inject(BlockEditorService);


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

  public blocks: Block[];

  private _destroy$ = new Subject();

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this.config = {
      ...this.config,
      unit: 'in',
    };

    this._blockEditor.init(this.config);
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
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
