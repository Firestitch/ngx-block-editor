import { Directive, TemplateRef, ElementRef } from '@angular/core';


@Directive({
    selector: '[fsBlockEditorMargin]',
    standalone: true
})
export class FsBlockEditorMarginDirective {

  constructor(
    private _elementRef: ElementRef) {
  }

  public get element() {
    return this._elementRef.nativeElement;
  }
}
