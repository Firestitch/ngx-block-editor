import { skipWhile, takeUntil } from 'rxjs/operators';
import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild,
} from '@angular/core';

import { FsHtmlEditorComponent, FsHtmlEditorConfig } from '@firestitch/html-editor';

import Moveable from 'moveable';
import { fromEvent, Subject } from 'rxjs';

import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';

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

  @ViewChild(FsHtmlEditorComponent)
  public htmlEditor: FsHtmlEditorComponent;

  @Input() public block: Block<any>;
  @Input() public html: string;

  @Output() changed = new EventEmitter<Block<any>>();

  public matrix;
  public unit;
  public content: string;
  public justifyContent;
  public htmlConfig: FsHtmlEditorConfig = {};

  private _moveable;
  private _editable = false;
  private _selectedElements = [];
  private _rotateStart;
  private _destroy$ = new Subject();

  constructor(
    private _service: BlockEditorService,
    private _elementRef: ElementRef,
    private _cdRef: ChangeDetectorRef,
  ) { }

  public get el(): any {
    return this.element.nativeElement;
  }

  public get moveable(): any {
    return this._moveable;
  }

  public get editable(): any {
    return this._editable;
  }

  public set elementGuidelines(value) {
    this._moveable.elementGuidelines = value;
  }

  public set editable(value) {
    this._editable = value;

    if (!value) {
      this.deselectContent();
    }
  }

  public set clippable(value) {
    this._moveable.clippable = value;
  }

  public set transformable(value) {
    this.moveable.draggable = value;
    this.moveable.resizable = value;
    this.moveable.draggable = value;
    this.moveable.roundable = value;
    this.moveable.rotatable = value;
  }

  public set lineHeight(value) {
    this.block.lineHeight = value;
    this._triggerChanged();
  }

  public set borderWidth(value) {
    this.block.borderWidth = value;
    this._triggerChanged();
  }

  public set fontSize(value) {
    this.block.fontSize = value;
    this._triggerChanged();
  }

  public set backgroundColor(value) {
    this.block.backgroundColor = value;
    this._triggerChanged();
  }

  public set width(value) {
    this.element.nativeElement.style.width = `${value}${this.unit}`;
    this.block.width = value;
    this._moveable.updateRect();
    this._triggerChanged();
  }

  public set height(value) {
    this.element.nativeElement.style.height = `${value}${this.unit}`;
    this.block.height = value;
    this._moveable.updateRect();
    this._triggerChanged();
  }

  public set top(value) {
    this.element.nativeElement.style.top = `${value}${this.unit}`;
    this.block.top = value;
    this._moveable.updateRect();
    this._triggerChanged();
  }

  public set left(value) {
    this.element.nativeElement.style.left = `${value}${this.unit}`;
    this.block.left = value;
    this._moveable.updateRect();
    this._triggerChanged();
  }

  public set rotate(value) {
    this._moveable.request('rotatable', { rotate: value }, true);
    this.block.rotate = value;
    this._triggerChanged();
  }

  public set shapeRadius(value) {
    this.block.shapeRadius = value;
    this._triggerChanged();
  }

  public set index(value) {
    this.block.index = value;
  }

  public set borderColor(value) {
    this.block.borderColor = value;
    this._triggerChanged();
  }

  public set paddingAll(value) {
    this.block.padding = value;
    this.block.paddingTop = null;
    this.block.paddingBottom = null;
    this.block.paddingLeft = null;
    this.block.paddingRight = null;
    this._triggerChanged();
  }

  public padding(name, value) {
    this.block[name] = value;
    this.block.padding = null;
    this._triggerChanged();
  }

  public set imageUrl(value) {
    this.block.imageUrl = value;
    this._triggerChanged();
  }

  public set fontColor(value) {
    this.block.fontColor = value;
    this._triggerChanged();
  }

  public set verticalAlign(value) {
    this.block.verticalAlign = value;
    this._triggerChanged();
  }

  public shapeRound(name, value) {
    this.block[name] = value;
    this._triggerChanged();
  }

  public set horizontalAlign(value) {
    this.block.horizontalAlign = value;
    this._triggerChanged();
  }

  public set italic(value) {
    this.block.italic = value;
    this._triggerChanged();
  }

  public get italic() {
    return this.block.italic;
  }

  public set bold(value) {
    this.block.bold = value;
    this._triggerChanged();
  }

  public get bold() {
    return this.block.bold;
  }

  public set underline(value) {
    this.block.underline = value;
    this._triggerChanged();
  }

  public get underline() {
    return this.block.underline;
  }

  public markForCheck(): void {
    this._cdRef.markForCheck();
  }

  public ngOnInit(): void {
    this.block = this._service.sanitizeBlock(this.block);
    this.unit = this._service.config.unit;
    this.content = this.block.content;

    this.htmlConfig = {
      autofocus: false,
      froalaConfig: {}
    };
  }

  public saveSelectedElements(): void {
    this._selectedElements = this.htmlEditor.editor.selection.blocks();
  }

  public clearSelectedElements(): void {
    this._selectedElements = [];
  }

  public ngAfterContentInit(): void {
    this.el.style.width = this.block.width + this.unit;
    this.el.style.height = this.block.height + this.unit;
    this.el.style.top = this.block.top + this.unit;
    this.el.style.left = this.block.left + this.unit;
    this._setTransform();

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
      ).subscribe((event: UIEvent) => {

        if (this.editable) {
          if (this.contentElement.nativeElement.isSameNode(event.target)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          }
        } else {
          this._service.selectedBlockComponents = [this];
        }
      });

    fromEvent(this.el, 'dblclick')
      .pipe(
        skipWhile(() => {
          return this.editable;
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((e) => {
        this.editable = true;

        setTimeout(() => {
          this.selectAll();
        });
    });

    this._moveable = new Moveable(this._elementRef.nativeElement, {
      target: this.el,
      container: this._service.container,
      draggable: false,
      resizable: false,
      scalable: false,
      rotatable: false,
      warpable: false,
      origin: false,
      keepRatio: false,
      snappable: true,
      snapHorizontal: true,
      snapVertical: true,
      snapCenter: true,
      snapElement: true,
      edge: false,
      throttleDrag: 1,
      throttleScale: 0.01,
      throttleRotate: 1,
      throttleResize: 1,
    });

    this._service.registerBlock(this);

    this._moveable
    .on('clip', e => {
        this.block.clipPath = e.clipStyle;
      e.target.style.clipPath = e.clipStyle;
      this._triggerChanged();
    });

    this._moveable.on('dragStart', ({ target, clientX, clientY }) => {
      this.editable = false;
    }).on('drag', ({ target, left, top }) => {
      target!.style.left = this.pxToIn(left) + this.unit;
      target!.style.top = this.pxToIn(top) + this.unit;
      this.block.top = this.pxToIn(top);
      this.block.left = this.pxToIn(left);
      this._triggerChanged();
    });

    this._moveable.on('resizeStart', ({ target, clientX, clientY }) => {
      this.editable = false;
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
    });

    this._moveable.on('rotateStart', ({ target, clientX, clientY }) => {
      this.editable = false;
      this._rotateStart = this.block.rotate || 0;
    }).on('rotate', ({ rotate, transform }) => {
      this.block.rotate = this._rotateStart + rotate;
      this.el.style.transform = transform;
      this._triggerChanged();
    });

  }

  public pxToIn(px) {
    return this.round(px / 96, 2);
  }

  public round(value, decimals) {
    return parseFloat(value.toFixed(decimals));
  }

  public deselect() {
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
    //const el = this.htmlEditor.editor.$el.get(0);
    range.selectNodeContents(this.contentEditable.nativeElement);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  public ngOnDestroy(): void {
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
    this.changed.emit(this.block);
  }
}
