import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { FsColorPickerModule } from '@firestitch/colorpicker';
import { FsFileModule } from '@firestitch/file';
import { FsMenuModule } from '@firestitch/menu';
import { FsZoomPanModule } from '@firestitch/zoom-pan';

import { FsBlockComponent } from './components/block/block.component';
import { FsBlockEditorComponent } from './components/block-editor/block-editor.component';
import { FsBlockEditorSidebarPanelDirective } from './directives/block-editor-sidebar-panel.directive';
import { FsBlockEditorMarginDirective } from './directives/block-editor-margin.directive';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ArtboardComponent } from './components/artboard/artboard.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,

    FsFileModule,
    FsColorPickerModule,
    FsMenuModule,
    FsZoomPanModule,
  ],
  exports: [
    FsBlockComponent,
    FsBlockEditorComponent,
    FsBlockEditorSidebarPanelDirective,
  ],
  declarations: [
    FsBlockComponent,
    FsBlockEditorComponent,
    FsBlockEditorSidebarPanelDirective,
    FsBlockEditorMarginDirective,
    SidebarComponent,
    ArtboardComponent,
  ],
})
export class FsBlockEditorModule {
  static forRoot(): ModuleWithProviders<FsBlockEditorModule> {
    return {
      ngModule: FsBlockEditorModule,
    };
  }
}
