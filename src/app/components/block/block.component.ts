import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef, Component, ElementRef,
  HostBinding,
  HostListener,
  Input, OnDestroy, OnInit, ViewChild,
} from '@angular/core';

import { round } from '@firestitch/common';
import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Subject, fromEvent } from 'rxjs';
import { filter, skip, takeUntil } from 'rxjs/operators';

import Moveable, { OnClip, OnClipEnd } from 'moveable';

import { BlockTypes } from '../../consts';
import { BlockType } from '../../enums';
import { Block } from '../../interfaces';
import { BlockEditorService, GoogleFontService } from '../../services';


@Component({
  selector: 'fs-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsBlockComponent implements OnDestroy, OnInit, AfterViewInit {

  @ViewChild('element', { static: true })
  public element: ElementRef;

  @ViewChild('contentElement', { static: true })
  public contentElement: ElementRef;

  @ViewChild('contentEditable', { static: true })
  public contentEditable: ElementRef;

  @Input('block')
  public set block(block: Block) {
    this._block = block;
    this._block.resizable = !this.hasType([BlockType.Checkbox, BlockType.RadioButton]);
    this._block.rotatable = !this.hasType([BlockType.Checkbox, BlockType.RadioButton]);
    this._block.scalable = !this.hasType([BlockType.Checkbox, BlockType.RadioButton]);
    if (this.moveable) {
      this._updateMoveable();
    }

    this.typeForm = BlockTypes
      .some((blockType) => {
        return blockType.type === 'form' && blockType.value === this.block.type;
      });
  }

  public get block(): Block {
    return this._block;
  }

  @Input() public html: string;
  @Input() public zoompan: FsZoomPanComponent;

  @HostBinding('class.transforming')
  public transformating = false;

  public unit: string;
  public content;
  public selected;
  public BlockType = BlockType;
  public typeForm: boolean;

  private _moveable;
  private _block: Block;
  private _editable = false;
  private _transformable = false;
  private _destroy$ = new Subject();

  constructor(
    private _blockEditor: BlockEditorService,
    private _elementRef: ElementRef,
    private _cdRef: ChangeDetectorRef,
    private _googleFontService: GoogleFontService,
  ) { }


  @HostListener('document:keydown', ['$event'])
  public keydown(event: KeyboardEvent): void {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.key) !== -1) {
      this._move(event);
    }

    if (['Delete', 'Backspace'].indexOf(event.key) !== -1) {
      this._delete(event);
    }
  }

  public get el(): any {
    return this.element.nativeElement;
  }

  public get moveable(): Moveable {
    return this._moveable;
  }

  public hasType(types) {
    return types.includes(this.block.type);
  }

  public get editable(): any {
    return this._editable;
  }

  public set editable(value) {
    this._editable = value;

    if (!value) {
      this.deselectContent();
    }
  }

  public get styleTop(): string {
    const top = this.block.top;

    return `${top}${this.unit}`;
  }

  public get styleLeft(): string {
    const left = this.block.left;

    return `${left}${this.unit}`;
  }

  public get styleWidth(): string {
    let width = this.block.width;
    if (this.block.clipPath) {
      width -= (this.block.width * this.block.clipPath.values[1] / 100) +
        (this.block.width * this.block.clipPath.values[3] / 100);
    }

    return `${width}${this.unit}`;
  }

  public get styleHeight(): string {
    let height = this.block.height;
    if (this.block.clipPath) {
      height -= (this.block.height * this.block.clipPath.values[0] / 100) +
        (this.block.height * this.block.clipPath.values[2] / 100);
    }

    return `${height}${this.unit}`;
  }

  public get styleImageHeight(): string {
    const height = this.block.height;
    if (this.block.clipPath) {
      const values = this.block.clipPath.values || {};
    }

    return `${height}${this.unit}`;
  }

  public get styleImageWidth(): string {
    const width = this.block.width;
    if (this.block.clipPath) {
      const values = this.block.clipPath.values || {};
    }

    return `${width}${this.unit}`;
  }

  public get styleImageTop(): string {
    let top = 0;
    if (this.block.clipPath) {
      const values = this.block.clipPath.values || {};
      top = (values[0] / 100) * this.block.width * -1;
    }

    return `${top}${this.unit}`;
  }

  public get styleImageLeft(): string {
    let left = 0;
    if (this.block.clipPath) {
      const values = this.block.clipPath.values || {};
      left = (values[3] / 100) * this.block.width * -1;
    }

    return `${left}${this.unit}`;
  }

  public get styleClipPath(): string {
    if (!this.block.clipPath) {
      return null;
    }

    const values = this.block.clipPath.values || {};
    const top = values[0] / 100 * this.block.height;
    const right = (values[1]) / 100 * this.block.width;
    const bottom = (values[2]) / 100 * this.block.height;
    const left = values[3] / 100 * this.block.width;

    const clipPath = `inset(${top}${this.unit} ${right}${this.unit} ${bottom}${this.unit} ${left}${this.unit})`;

    return clipPath;
  }

  public get styleBoxShadow(): string {
    if (!this.block.shadowColor) {
      return null;
    }

    const shadow = `${this.block.shadowX}pt ${(this.block.shadowY || 0)}pt ${(this.block.shadowBlur || 0)}pt ${(this.block.shadowSpread || 0)}pt  ${this.block.shadowColor}`;

    return shadow;
  }

  public set elementGuidelines(value) {
    this.moveable.elementGuidelines = value;
  }

  public get clippable(): boolean {
    return !!this.moveable.clippable;
  }

  public set clippable(value: boolean) {
    this.moveable.clippable = value;
    if (this.selected) {
      this.moveable.resizable = !value;
      this.moveable.rotatable = !value;
      this.moveable.scalable = !value;
    }
  }

  public get transformable() {
    return this._transformable;
  }

  public set transformable(value) {
    this._transformable = value;
    this._updateMoveable();
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
    this.block.shadowOpacity = this.block.shadowOpacity || 100;
    this._initFonts();

    this._blockEditor.selectedBlocks$
      .pipe(
        skip(1),
        takeUntil(this._destroy$),
      )
      .subscribe((blocks) => {
        this.selected = blocks.includes(this.block);
        this.transformable = true;
        this._cdRef.markForCheck();
      });

    this._blockEditor.blockClippable$
      .pipe(
        filter(() => this.selected),
        takeUntil(this._destroy$),
      )
      .subscribe((clippable) => {
        this.clippable = clippable;
        this._cdRef.markForCheck();
      });

    this._blockEditor.blockAdded$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._cdRef.markForCheck();
      });

    this._blockEditor.blockUpdated$
      .pipe(
        filter((block) => block.guid === this.block.guid),
        takeUntil(this._destroy$),
      )
      .subscribe((block) => {
        this.block = block;
        this._cdRef.markForCheck();
      });

    this._blockEditor.blockChanged$
      .pipe(
        filter((block) => block.guid === this.block.guid),
        takeUntil(this._destroy$),
      )
      .subscribe((block) => {
        this.block = block;
        this._cdRef.markForCheck();
      });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this._initEvents();
      this._initMoveable();
      this._setTransform();
      this._initElementGuidelines();
      this.rotate = this.block.rotate;
    });
  }

  public pxToIn(px) {
    return this.round(px / 96, 2);
  }

  public round(value, decimals) {
    return parseFloat(value.toFixed(decimals));
  }

  public deselect(): void {
    this.editable = false;
    this.clippable = false;
    this.transformable = false;
    this.disableContentEdit();
  }

  public disableContentEdit(): void {
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

  public selectTextAll(): void {
    const range = document.createRange();
    range.selectNodeContents(this.contentEditable.nativeElement);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  public ngOnDestroy(): void {
    //this._blockEditor.destroyBlock(this.block);
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setTransform(transforms = []): void {
    transforms = transforms ?? [];
    this.el.style.transform = transforms.join(' ');
  }

  private _triggerChanged() {
    this._blockEditor.blockChange(this.block);
  }

  private _updateMoveable(): void {
    const value = !this.block.lock && this.selected;
    this.keepRatio = this.block.keepRatio;
    this.rotate = this.block.rotate;
    this.moveable.resizable = this.block.resizable && value;
    this.moveable.rotatable = this.block.rotatable && value;
    this.moveable.scalable = this.block.scalable && value;
  }

  private _initElementGuidelines(): void {
    this._blockEditor.blockComponents$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blockComponents) => {
        this.moveable.elementGuidelines = blockComponents
          .filter((blockComponent) => this !== blockComponent)
          .map((blockComponent) => blockComponent.el);
      });
  }

  private _initMoveable(): void {
    this._moveable = new Moveable(this._elementRef.nativeElement, {
      target: this.el,
      container: this._blockEditor.container,
      draggable: true,
      resizable: false,
      scalable: false,
      rotatable: false,
      warpable: false,
      origin: false,
      clipRelative: true,
      clipArea: true,
      keepRatio: this.block.keepRatio,
      snappable: true,
      snapDirections: { left: true, top: true, right: true, bottom: true, center: true, middle: true },
      elementSnapDirections: { left: true, top: true, right: true, bottom: true, center: true, middle: true },
      edge: false,
      throttleDrag: 1,
      throttleScale: 0.01,
      throttleRotate: 1,
      throttleResize: 1,
      snapDistFormat: (v, type) => `${this.round(v / 96, 2)}`,
    });

    this._updateMoveable();

    this.moveable
      .on('clip', (e: OnClip) => {
        this.moveable.keepRatio = false;
        e.target.style.clipPath = e.clipStyle;

        this.block.clipPath = {
          type: 'inset',
          values: e.clipStyles
            .map((value) => {
              const n = Number(value.replace('%', ''));

              return n > 0 ? n : 0;
            }),
        };
      })
      .on('clipEnd', (e: OnClipEnd) => {
        this.moveable.keepRatio = true;
        e.target.style.clipPath = null;

        this._triggerChanged();

        setTimeout(() => {
          this.moveable.updateRect();
        }, 100);
      })
      .on('dragStart', () => {
        this.disableContentEdit();
        this.transformating = true;
        this._cdRef.markForCheck();
      })
      .on('drag', ({ target, left, top }) => {
        target.style.left = `${this.pxToIn(left)}${this.unit}`;
        target.style.top = `${this.pxToIn(top)}${this.unit}`;
        this.block.top = this.pxToIn(top);
        this.block.left = this.pxToIn(left);
      })
      .on('dragEnd', () => {
        this.transformating = false;
        this._triggerChanged();
        this._cdRef.markForCheck();
      })
      .on('resizeStart', () => {
        this.disableContentEdit();
        this.zoompan.disable();
        this.transformating = true;
        this._cdRef.markForCheck();
      })
      .on('resize', ({ target, width, height, dist, delta, direction }) => {
        width = this.pxToIn(width);
        height = this.pxToIn(height);

        if (delta[0]) {
          this.block.width = width;
          target.style.width = `${width}${this.unit}`;
        }

        if (delta[1]) {
          this.block.height = height;
          target.style.height = `${height}${this.unit}`;
        }

        const transform = [0, 0];
        if (direction[1] === -1) {
          transform[1] = dist[1] * -1;
        }

        if (direction[0] === -1) {
          transform[0] = dist[0] * -1;
        }

        this._setTransform([`translate(${transform[0]}px, ${transform[1]}px)`]);
      })
      .on('resizeEnd', ({ target }) => {
        const matrix = new WebKitCSSMatrix(target.style.transform);
        this.block.top = parseFloat(target.style.top) + this.pxToIn(matrix.m42);
        this.block.left = parseFloat(target.style.left) + this.pxToIn(matrix.m41);
        this._setTransform();
        this._triggerChanged();
        this.zoompan.enable();
        this.transformating = false;
        this._cdRef.markForCheck();

        target.style.top = `${this.block.top}in`;
        target.style.left = `${this.block.left}in`;
        target.style.width = `${this.block.width}in`;
        target.style.height = `${this.block.height}in`;
        this.moveable.updateRect();
      })
      .on('rotateStart', ({ inputEvent }) => {
        if (inputEvent) {
          this.zoompan.disable();
          this.disableContentEdit();
          this.transformating = true;
          this._cdRef.markForCheck();
        }
      })
      .on('rotate', ({ inputEvent, transform, rotation }) => {
        this.el.style.transform = transform;
        this.block.rotate = rotation % 360;

        if (inputEvent) {
          this.zoompan.enable();
        }
      })
      .on('rotateEnd', ({ inputEvent }) => {
        if (inputEvent) {
          this.transformating = false;
          this._cdRef.markForCheck();
          this._triggerChanged();
        }
      });
  }

  private _initEvents(): void {
    fromEvent(this.contentEditable.nativeElement, 'paste')
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((e: any) => {
        e.preventDefault();
        const clipboardData = e.clipboardData;
        const text = clipboardData.getData('Text');
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        this.block.content = this.contentEditable.nativeElement.innerHTML;
        this._triggerChanged();
      });

    fromEvent(this.contentEditable.nativeElement, 'input')
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((event: any) => {
        if (this.typeForm) {
          this.block.name = event.target.innerHTML;
        } else {
          this.block.content = event.target.innerHTML;
        }

        this._triggerChanged();
      });

    fromEvent(this.el, 'mousedown')
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((event: UIEvent) => {
        if (this.block.lock) {
          event.preventDefault();
          event.stopImmediatePropagation();
          event.stopPropagation();
        } else {
          this.zoompan.disable();
        }

        if (!this.moveable.clippable) {
          if (this.editable) {
            if (this.contentElement.nativeElement.isSameNode(event.target)) {
              event.preventDefault();
              event.stopImmediatePropagation();
              event.stopPropagation();
            }
          } else {
            this._blockEditor.selectedBlock = this.block;
          }
        }
      });

    fromEvent(this.el, 'mouseup')
      .pipe(
        takeUntil(this._destroy$),
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
            this.selectTextAll();
          });
        }
      });
  }

  private _initFonts(): void {
    if (this.block.fontFamily) {
      this._googleFontService.loadFont({ family: this.block.fontFamily });
    }
  }

  private _move(event): void {
    if (
      !this.selected ||
      this.editable
    ) {
      return;
    }

    event.preventDefault();
    const inchPixel = 1 / 100;

    switch (event.key) {
      case 'ArrowUp':
        this.block.top = round(this.block.top - inchPixel, 2);
        break;
      case 'ArrowDown':
        this.block.top = round(this.block.top + inchPixel, 2);
        break;
      case 'ArrowLeft':
        this.block.left = round(this.block.left - inchPixel, 2);
        break;
      case 'ArrowRight':
        this.block.left = round(this.block.left + inchPixel, 2);
        break;
    }

    this._blockEditor.blockChange(this.block);
  }

  private _delete(event): void {
    if (
      this.selected &&
      !this.editable &&
      (event.target as any)?.nodeName !== 'INPUT' &&
      (event.target as any)?.nodeName !== 'TEXTAREA'
    ) {
      event.preventDefault();
      this._blockEditor.removeBlocks([this.block]);
    }
  }

}
