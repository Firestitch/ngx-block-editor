import { Directive, TemplateRef, ElementRef } from '@angular/core';


@Directive({
  selector: '[fsBlockEditorMargin]'
})
export class FsBlockEditorMarginDirective {

  constructor(
    private _elementRef: ElementRef) {
  }

  public get element() {
    return this._elementRef.nativeElement;
  }
}
