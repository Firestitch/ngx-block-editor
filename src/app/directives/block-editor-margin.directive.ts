import { Directive, TemplateRef, ElementRef, inject } from '@angular/core';


@Directive({
    selector: '[fsBlockEditorMargin]',
    standalone: true
})
export class FsBlockEditorMarginDirective {
  private _elementRef = inject(ElementRef);


  public get element() {
    return this._elementRef.nativeElement;
  }
}
