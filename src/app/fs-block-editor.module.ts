import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FsAutocompleteModule } from '@firestitch/autocomplete';
import { FsColorPickerModule } from '@firestitch/colorpicker';
import { FsDialogModule } from '@firestitch/dialog';
import { FsFileModule } from '@firestitch/file';
import { FsFontPickerModule } from '@firestitch/font-picker';
import { FsFormModule } from '@firestitch/form';
import { FsMaskModule } from '@firestitch/mask';
import { FsMenuModule } from '@firestitch/menu';
import { FsZoomPanModule } from '@firestitch/zoom-pan';

import { GroupDialogComponent } from './components';
import { ArtboardComponent } from './components/artboard/artboard.component';
import { FsBlockEditorComponent } from './components/block-editor/block-editor.component';
import { FsBlockComponent } from './components/block/block.component';
import { LayersReorderDialogComponent } from './components/layers-reorder-dialog/layers-reorder-dialog.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FsBlockEditorMarginDirective } from './directives/block-editor-margin.directive';
import { FsBlockEditorSidebarPanelDirective } from './directives/block-editor-sidebar-panel.directive';
import { CreateImageUrlPipe } from './pipes/create-image-url.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,

    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule,
    MatListModule,

    FsFileModule,
    FsColorPickerModule,
    FsMenuModule,
    FsZoomPanModule,
    FsFormModule,
    FsMaskModule,
    FsFontPickerModule,

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
    CreateImageUrlPipe,
    GroupDialogComponent,
  ],
})
export class FsBlockEditorModule {
  public static forRoot(): ModuleWithProviders<FsBlockEditorModule> {
    return {
      ngModule: FsBlockEditorModule,
    };
  }
}
