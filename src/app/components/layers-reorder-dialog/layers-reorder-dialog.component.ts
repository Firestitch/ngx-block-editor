import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { index } from '@firestitch/common';

import { BlockTypes } from '../../consts/block-types.const';
import { Block } from '../../interfaces';
import { FsBlockComponent } from '../block/block.component';


@Component({
  templateUrl: './layers-reorder-dialog.component.html',
  styleUrls: ['./layers-reorder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayersReorderDialogComponent {

  public blocks: Block[];

  public blockTypeIcons = index(BlockTypes, 'value', 'icon');

  constructor(
    @Inject(MAT_DIALOG_DATA)
    _dialogData: unknown,
    private _dialogRef: MatDialogRef<LayersReorderDialogComponent>,
  ) {
    this._init(_dialogData);
  }

  public swapItems(event: CdkDragDrop<FsBlockComponent>): void {
    moveItemInArray(this.blocks, event.previousIndex, event.currentIndex);
  }

  public done(): void {
    this._dialogRef.close(this.blocks.reverse());
  }

  private _init(data: any) {
    this.blocks = data.blocks;
  }
}
