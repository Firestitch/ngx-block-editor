import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { index } from '@firestitch/common';

import { BlockTypes } from '../../consts/block-types.const';
import { Block } from '../../interfaces';
import { FsBlockComponent } from '../block/block.component';
import { FsDialogModule } from '@firestitch/dialog';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatList, MatListItem } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { FsFormModule } from '@firestitch/form';


@Component({
    templateUrl: './layers-reorder-dialog.component.html',
    styleUrls: ['./layers-reorder-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FsDialogModule,
        MatDialogTitle,
        MatIcon,
        CdkScrollable,
        MatDialogContent,
        MatList,
        CdkDropList,
        MatDivider,
        MatListItem,
        CdkDrag,
        CdkDragHandle,
        MatDialogActions,
        MatButton,
        FsFormModule,
    ],
})
export class LayersReorderDialogComponent {
  private _dialogData = inject(MAT_DIALOG_DATA);
  private _dialogRef = inject<MatDialogRef<LayersReorderDialogComponent>>(MatDialogRef);


  public blocks: Block[];

  public blockTypeIcons = index(BlockTypes, 'value', 'icon');

  constructor() {
    const _dialogData = this._dialogData;

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
