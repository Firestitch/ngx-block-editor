import { Directive, Input, TemplateRef, inject } from '@angular/core';


@Directive({
    selector: '[fsBlockEditorSidebarPanel]',
    standalone: true,
})
export class FsBlockEditorSidebarPanelDirective {
  templateRef = inject<TemplateRef<any>>(TemplateRef);


  @Input() public label: string;
  @Input() public show = true;
}
