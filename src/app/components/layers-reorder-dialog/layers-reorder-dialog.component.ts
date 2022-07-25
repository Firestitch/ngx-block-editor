import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { index } from '@firestitch/common';

import { FsBlockComponent } from '../block/block.component';
import { BlockTypes } from '../../consts/block-types.const';


@Component({
  templateUrl: './layers-reorder-dialog.component.html',
  styleUrls: [
    './layers-reorder-dialog.component.scss',
  ]
})
export class LayersReorderDialogComponent {

  public fields: FsBlockComponent[];

  public blockTypeIcons = index(BlockTypes, 'value', 'icon');

  constructor(
    @Inject(MAT_DIALOG_DATA)
    _dialogData: unknown,
    private _dialogRef: MatDialogRef<LayersReorderDialogComponent>,
  ) {
    this._init(_dialogData);
  }

  public swapItems(event: CdkDragDrop<FsBlockComponent>): void {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }

  public done(): void {
    this._dialogRef.close(this.fields);
  }

  private _init(data: any) {
    this.fields = data.fields;
  }
}
