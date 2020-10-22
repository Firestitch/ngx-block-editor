import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, Input,
  OnDestroy, OnInit, QueryList, ViewChild, ViewChildren
} from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  }

  public artboardClick(event): void {
    if (
      event.target.isSameNode(this.artboard.nativeElement) ||
      event.target.isSameNode(this.artboardContainer.nativeElement)
    ) {
      this._service.selectedBlockComponents.forEach((block) => {
        block.deselect();
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

  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
