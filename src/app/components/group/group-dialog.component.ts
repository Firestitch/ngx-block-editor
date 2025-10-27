import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

import { guid } from '@firestitch/common';
import { Observable, of } from 'rxjs';
import { Block, BlockGroup } from '../../interfaces';
import { BlockEditorService } from '../../services';
import { FormsModule } from '@angular/forms';
import { FsFormModule } from '@firestitch/form';
import { FsDialogModule } from '@firestitch/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';


@Component({
    templateUrl: './group-dialog.component.html',
    styleUrls: ['./group-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        FsFormModule,
        FsDialogModule,
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatInput,
        CdkTextareaAutosize,
        MatLabel,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
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
