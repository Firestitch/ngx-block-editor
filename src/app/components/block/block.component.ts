import { filter, takeUntil } from 'rxjs/operators';
import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  Input, OnDestroy, OnInit, ViewChild,
} from '@angular/core';

import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import Moveable from 'moveable';
import { fromEvent, Subject } from 'rxjs';

import { BlockEditorService } from './../../services';
import { Block } from './../../interfaces/block';
import { BlockType } from '../../enums';

@Component({
  selector: 'fs-block',
  templateUrl: 'block.component.html',
  styleUrls: [ 'block.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsBlockComponent implements OnDestroy, AfterContentInit, OnInit {

  @ViewChild('element', { static: true })
  public element: ElementRef;

  @ViewChild('contentElement', { static: true })
  public contentElement: ElementRef;

  @ViewChild('contentEditable', { static: true })
  public contentEditable: ElementRef;

  @Input() public block: Block;
  @Input() public html: string;
  @Input() public zoompan: FsZoomPanComponent;

  public unit;
  public content: string;
  public BlockType = BlockType;

  private _moveable;
  private _editable = false;
  private _transformable = false;
  private _rotateStart;
  private _destroy$ = new Subject();

  constructor(
    private _blockEditor: BlockEditorService,
    private _elementRef: ElementRef,
    private _cdRef: ChangeDetectorRef,
  ) { }

  public get el(): any {
    return this.element.nativeElement;
  }

  public get moveable(): Moveable {
    return this._moveable;
  }

  public get editable(): any {
    return this._editable;
  }

  public set elementGuidelines(value) {
    this.moveable.elementGuidelines = value;
  }

  public set editable(value) {
    this._editable = value;

    if (!value) {
      this.deselectContent();
    }
  }

  public set clippable(value) {
    this.moveable.clippable = value;
  }

  public get transformable() {
    return this._transformable;
  }

  public set transformable(value) {
    this._transformable = value;
    this.moveable.draggable = value;
    this.moveable.resizable = value;
    this.moveable.roundable = value;
    this.moveable.rotatable = value;
  }

  public set width(value) {
    this.element.nativeElement.style.width = `${parseFloat(value)}${this.unit}`;
    this.moveable.updateRect();
  }

  public set height(value) {
    this.element.nativeElement.style.height = `${parseFloat(value)}${this.unit}`;
    this.moveable.updateRect();
  }

  public set top(value) {
    this.element.nativeElement.style.top = `${parseFloat(value)}${this.unit}`;
    this.moveable.updateRect();
  }

  public set left(value) {
    this.element.nativeElement.style.left = `${parseFloat(value)}${this.unit}`;
    this.moveable.updateRect();
  }

  public set rotate(value) {
    this.moveable.request('rotatable', { rotate: parseFloat(value) }, true);
    this.moveable.updateRect();
  }

  public set index(value) {
    this.block.index = value;
  }

  public set keepRatio(value) {
    this.moveable.keepRatio = value;
  }

  public markForCheck(): void {
    this._cdRef.markForCheck();
  }

  public ngOnInit(): void {
    this.unit = this._blockEditor.config.unit;
    this.content = this.block.content;

    this._blockEditor.blockChanged$
    .pipe(
      filter((block) => block === this.block),
      takeUntil(this._destroy$),
    )
    .subscribe((block) => {
      this.keepRatio = block.keepRatio;
      this.width = block.width;
      this.height = block.height;
      this.top = block.top;
      this.left = block.left;
      this._cdRef.markForCheck();
    });
  }

  public ngAfterContentInit(): void {
    setTimeout(() => {
      this._initEvents();
      this._initMoveable();
      this._setTransform();

      this.width = this.block.width;
      this.height = this.block.height;
      this.top = this.block.top;
      this.left = this.block.left;

      this._blockEditor.registerBlock(this.block, this);
    });
  }

  public pxToIn(px) {
    return this.round(px / 96, 2);
  }

  public round(value, decimals) {
    return parseFloat(value.toFixed(decimals));
  }

  public deselect(): void {
    this.transformable = false;
    this.editable = false;
  }

  public deselectContent() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
      }
    }
  }

  public selectAll(): void {
    const range = document.createRange();
    range.selectNodeContents(this.contentEditable.nativeElement);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  public ngOnDestroy(): void {
    this._blockEditor.unregisterBlock(this.block);
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setTransform(transforms = []): void {
    transforms = transforms ?? [];

    if (this.block.rotate) {
      transforms.push(`rotate(${this.block.rotate}deg)`);
    }

    this.el.style.transform = transforms.join(' ');
  }

  private _triggerChanged() {
    this._blockEditor.blockChange(this.block);
  }

  private _initMoveable(): void {
    this._moveable = new Moveable(this._elementRef.nativeElement, {
      target: this.el,
      container: this._blockEditor.container,
      draggable: false,
      resizable: false,
      scalable: false,
      rotatable: false,
      warpable: false,
      origin: false,
      keepRatio: this.block.keepRatio,
      snappable: true,
      edge: false,
      throttleDrag: 1,
      throttleScale: 0.01,
      throttleRotate: 1,
      throttleResize: 1,
    });

    this.moveable
    .on('clip', (e) => {
        this.block.clipPath = e.clipStyle;
      e.target.style.clipPath = e.clipStyle;
      this._triggerChanged();
    });

    this.moveable.on('dragStart', ({ target, clientX, clientY }) => {
      this.editable = false;
    }).on('drag', ({ target, left, top }) => {
      target!.style.left = this.pxToIn(left) + this.unit;
      target!.style.top = this.pxToIn(top) + this.unit;
      this.block.top = this.pxToIn(top);
      this.block.left = this.pxToIn(left);
      this._triggerChanged();
    });

    this.moveable.on('resizeStart', ({ target, clientX, clientY }) => {
      this.editable = false;
      this.zoompan.disable();
    }).on('resize', ({ target, width, height, dist, delta, direction }) => {
      width = this.pxToIn(width);
      height = this.pxToIn(height);

      if (delta[0]) {
        this.block.width = width;
        target!.style.width = width + this.unit;
      }

      if (delta[1]) {
        this.block.height = height;
        target!.style.height = height + this.unit;
      }

      const transform = [0, 0];
      if (direction[1] === -1) {
        transform[1] = dist[1] * -1;
      }

      if (direction[0] === -1) {
        transform[0] = dist[0] * -1;
      }

      this._setTransform([`translate(${transform[0]}px, ${transform[1]}px)`]);
      this._triggerChanged();
      
    }).on('resizeEnd', ({ target }) => {
      const matrix = new WebKitCSSMatrix(target.style.transform);
      this.block.top = parseFloat(target.style.top) + this.pxToIn(matrix.m42);
      this.block.left = parseFloat(target.style.left) + this.pxToIn(matrix.m41);

      target.style.top = this.block.top + this.unit;
      target.style.left = this.block.left + this.unit;
      this._setTransform();
      this._triggerChanged();
      this.zoompan.enable();
    });

    this.moveable.on('rotateStart', ({ target, clientX, clientY }) => {
      this.zoompan.disable();
      this.editable = false;
      this._rotateStart = this.block.rotate || 0;
    }).on('rotate', ({ rotate, transform }) => {
      this.block.rotate = this._rotateStart + rotate;
      this.el.style.transform = transform;
      this._triggerChanged();
      this.zoompan.enable();
    });
  }

  private _initEvents(): void {
    fromEvent(this.contentEditable.nativeElement, 'input')
      .pipe(
        takeUntil(this._destroy$),
    ).subscribe((event: any) => {
        this.block.content = event.target.innerHTML;
        this._triggerChanged();
      });

      fromEvent(this.el, 'mousedown')
      .pipe(
        takeUntil(this._destroy$),
        filter(() => !this.block.readonly)
      ).subscribe((event: UIEvent) => {
        this.zoompan.disable();
        if (this.editable) {
          if (this.contentElement.nativeElement.isSameNode(event.target)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          }
        } else {
          this._blockEditor.selectedBlock = this.block;
        }
      });

      fromEvent(this.el, 'mouseup')
      .pipe(
        takeUntil(this._destroy$),
        filter(() => !this.block.readonly)
      ).subscribe(() => {
        this.zoompan.enable();
      });

    fromEvent(this.el, 'dblclick')
      .pipe(
        filter(() => (!this.editable)),
        takeUntil(this._destroy$),
      )
      .subscribe((event: MouseEvent) => {
        if (this.block.readonly) {
          event.preventDefault();
        } else {
          this.editable = true;
          this._cdRef.markForCheck();

          setTimeout(() => {
            this.selectAll();
          });
        }
    });

  }
}
