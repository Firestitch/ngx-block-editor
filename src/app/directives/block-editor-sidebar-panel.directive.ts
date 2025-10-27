import { Directive, Input, TemplateRef } from '@angular/core';


@Directive({
    selector: '[fsBlockEditorSidebarPanel]',
    standalone: true,
})
export class FsBlockEditorSidebarPanelDirective {

  @Input() public label: string;
  @Input() public show = true;


  constructor(public templateRef: TemplateRef<any>) {

  }
}
