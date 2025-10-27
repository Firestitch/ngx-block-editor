import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

import { FsBlockEditorMarginDirective } from '../../directives/block-editor-margin.directive';
import { FsBlockEditorSidebarPanelDirective } from '../../directives/block-editor-sidebar-panel.directive';
import { Block } from '../../interfaces/block';
import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService } from '../../services';
import { FsBlockComponent } from '../block';
import { SidebarComponent } from '../sidebar';
import { FsBlockComponent as FsBlockComponent_1 } from '../block/block.component';


@Component({
    selector: 'app-artboard',
    templateUrl: 'artboard.component.html',
    styleUrls: ['artboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FsBlockComponent_1],
})
export class ArtboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private _el = inject(ElementRef);
  private _blockEditor = inject(BlockEditorService);
  private _cdRef = inject(ChangeDetectorRef);


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

  public ngAfterViewInit(): void {
    this.blockComponents
      .changes
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._blockEditor.blockComponents = this.blockComponents.toArray();
      });

    this._blockEditor.blockComponents = this.blockComponents.toArray();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
