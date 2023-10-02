import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { guid } from '@firestitch/common';
import { Observable, of } from 'rxjs';
import { Block, BlockGroup } from '../../interfaces';
import { BlockEditorService } from '../../services';


@Component({
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDialogComponent implements OnInit {

  public block: Block;
  public blockGroup: BlockGroup;

  private _blockEditor: BlockEditorService;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data,
    private _dialogRef: MatDialogRef<GroupDialogComponent>,
  ) { }

  public ngOnInit(): void {
    this._blockEditor = this._data.blockEditor;
    this.blockGroup = this._data.blockGroup || {};
    this.block = this._data.block;
  }

  public save = (): Observable<any> => {
    if (this.blockGroup.name) {

    } else {
      this.blockGroup = {
        ...this.blockGroup,
        name: guid(),
      };

      this._blockEditor.blockGroups.push(this.blockGroup);
    }

    this._dialogRef.close(this.blockGroup);

    return of(true);
  }
}
