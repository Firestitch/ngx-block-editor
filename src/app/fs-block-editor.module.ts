import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FsColorPickerModule } from '@firestitch/colorpicker';
import { FsFileModule } from '@firestitch/file';
import { FsMenuModule } from '@firestitch/menu';
import { FsZoomPanModule } from '@firestitch/zoom-pan';
import { FsDialogModule } from '@firestitch/dialog';

import { FsBlockComponent } from './components/block/block.component';
import { FsBlockEditorComponent } from './components/block-editor/block-editor.component';
import { FsBlockEditorSidebarPanelDirective } from './directives/block-editor-sidebar-panel.directive';
import { FsBlockEditorMarginDirective } from './directives/block-editor-margin.directive';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ArtboardComponent } from './components/artboard/artboard.component';
import { LayersReorderDialogComponent } from './components/layers-reorder-dialog/layers-reorder-dialog.component';


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
    MatSelectModule,
    MatListModule,
    DragDropModule,

    FsFileModule,
    FsColorPickerModule,
    FsMenuModule,
    FsZoomPanModule,
    FsDialogModule,
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
    LayersReorderDialogComponent,
  ],
})
export class FsBlockEditorModule {
  static forRoot(): ModuleWithProviders<FsBlockEditorModule> {
    return {
      ngModule: FsBlockEditorModule,
    };
  }
}
