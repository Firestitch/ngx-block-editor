import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FsColorPickerModule } from '@firestitch/colorpicker';
import { FsDialogModule } from '@firestitch/dialog';
import { FsFileModule } from '@firestitch/file';
import { FsMenuModule } from '@firestitch/menu';
import { FsZoomPanModule } from '@firestitch/zoom-pan';

import { FsAutocompleteModule } from '@firestitch/autocomplete';
import { FontComponent } from './components';
import { ArtboardComponent } from './components/artboard/artboard.component';
import { FsBlockEditorComponent } from './components/block-editor/block-editor.component';
import { FsBlockComponent } from './components/block/block.component';
import { LayersReorderDialogComponent } from './components/layers-reorder-dialog/layers-reorder-dialog.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FsBlockEditorMarginDirective } from './directives/block-editor-margin.directive';
import { FsBlockEditorSidebarPanelDirective } from './directives/block-editor-sidebar-panel.directive';
import { CreateImageUrlPipe } from './pipes/create-image-url.pipe';
import { GoogleFontService } from './services';


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
    FsAutocompleteModule,
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
    FontComponent,
    CreateImageUrlPipe,
  ],
  providers: [
    GoogleFontService,
  ]
})
export class FsBlockEditorModule {
  static forRoot(): ModuleWithProviders<FsBlockEditorModule> {
    return {
      ngModule: FsBlockEditorModule,
    };
  }
}
