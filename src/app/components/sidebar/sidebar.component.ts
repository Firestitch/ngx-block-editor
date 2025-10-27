import { DOCUMENT, NgTemplateOutlet, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef,
  EventEmitter,
  Inject, Input,
  OnDestroy, OnInit,
  Output,
  QueryList,
} from '@angular/core';
import { UntypedFormControl, FormsModule } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { FsClipboard } from '@firestitch/clipboard';
import { guid, index, round } from '@firestitch/common';
import { FsFile, FsFileModule } from '@firestitch/file';
import { FsMessage } from '@firestitch/message';
import { FsPrompt } from '@firestitch/prompt';
import { FsZoomPanComponent } from '@firestitch/zoom-pan';

import { Observable, Subject, of } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { BlockFormats, BlockTypes } from '../../consts';
import { FsBlockEditorSidebarPanelDirective } from '../../directives';
import { BlockType } from '../../enums';
import { Block, BlockGroup } from '../../interfaces';
import { BlockEditorConfig } from '../../interfaces/block-editor-config';
import { BlockEditorService } from '../../services';
import { GroupDialogComponent } from '../group';
import { FsFormModule } from '@firestitch/form';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FsMaskModule } from '@firestitch/mask';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { FsFontPickerModule } from '@firestitch/font-picker';
import { FsColorPickerModule } from '@firestitch/colorpicker';


@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        FsFormModule,
        NgTemplateOutlet,
        FsFileModule,
        MatIconButton,
        MatTooltip,
        MatIcon,
        MatFormField,
        MatInput,
        FsMaskModule,
        MatPrefix,
        MatLabel,
        MatSelect,
        MatOption,
        CdkTextareaAutosize,
        MatCheckbox,
        FsFontPickerModule,
        FsColorPickerModule,
        NgClass,
    ],
})
export class SidebarComponent implements OnInit, OnDestroy {

  @ContentChildren(FsBlockEditorSidebarPanelDirective)
  public sidebarPanels: QueryList<FsBlockEditorSidebarPanelDirective>;

  @Input() public config: BlockEditorConfig;
  @Input() public blocks;
  @Input() public zoompan: FsZoomPanComponent;

  @Output() public zoomCenter = new EventEmitter();

  public block: Block;
  public BlockTypes = BlockTypes;
  public blockTypeNames = index(BlockTypes, 'value', 'name');
  public blockTypeIcons = index(BlockTypes, 'value', 'icon');
  public clippable = false;
  public BlockType = BlockType;
  public blockGroup;
  public blocksReordered: () => void;
  public formats = [];

  private _destroy$ = new Subject();

  constructor(
    private _el: ElementRef,
    private _blockEditor: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
    private _clipboard: FsClipboard,
    private _message: FsMessage,
    private _prompt: FsPrompt,
    private _dialog: MatDialog,
    @Inject(DOCUMENT)
    private _document: any,
  ) { }

  public get el(): any {
    return this._el.nativeElement;
  }

  public get blockGroups(): BlockGroup[] {
    return this._blockEditor.blockGroups;
  }

  public get blockTypeForm(): boolean {
    return this.block.type === BlockType.LongText ||
      this.block.type === BlockType.ShortText ||
      this.block.type === BlockType.RadioButton ||
      this.block.type === BlockType.Checkbox ||
      this.block.type === BlockType.Date ||
      this.block.type === BlockType.Signature;
  }

  public ngOnInit(): void {
    this._blockEditor.selectedBlocks$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((blocks: Block[]) => {
        this.block = blocks[0] ? blocks[0] : null;
        this.blockGroup = null;

        if (this.block) {
          this.formats = BlockFormats
            .filter((blockFormat) => (blockFormat.blockTypes.indexOf(this.block.type) !== -1));

          if (this.block.name) {
            this.blockGroup = this._blockEditor.blockGroups
              .find((blockGroup) => {
                return this.block.name === blockGroup.name;
              });
          }
        }

        this._cdRef.markForCheck();
      });

    this._blockEditor.blockChanged$
      .pipe(
        filter((block) => block === this.block),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._cdRef.markForCheck();
      });


    if (this._blockEditor.config.blocksReorder) {
      this.blocksReordered = () => {
        this._document.defaultView?.scrollTo(0, 0);
        this._blockEditor.openReorderDialog();
      };
    }
  }

  public blockGroupChange(blockGroup): void {
    this._blockEditor.applyBlockGroup(this.block, blockGroup);
  }

  public blockRequired(value): void {
    const values = { required: value, readonly: false };
    if (this.blockGroup) {
      this._blockEditor.blockGroupChangeProperty(this.blockGroup, values);
    } else {
      this.blockChangeProperty(values);
    }
  }

  public blockReadonly(value): void {
    const values = { readonly: value, required: false };
    if (this.blockGroup) {
      this._blockEditor.blockGroupChangeProperty(this.blockGroup, values);
    } else {
      this.blockChangeProperty(values);
    }
  }

  public blockGroupEdit(event: MouseEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.blockGroupDialog(this.blockGroup)
      .subscribe((blockGroup) => {
        this._blockEditor.blocks
          .filter((block) => block.name === blockGroup.name)
          .forEach((block) => {
            this._blockEditor.applyBlockGroup(block, blockGroup);
          });
      });
  }

  public blockGroupCreate(event: MouseEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.blockGroupDialog()
      .subscribe((blockGroup) => {
        this._blockEditor.applyBlockGroup(this.block, blockGroup);
        this.blockGroup = blockGroup;
        this._cdRef.markForCheck();
      });
  }

  public blockGroupDialog(blockGroup?): Observable<BlockGroup> {
    return this._dialog.open(
      GroupDialogComponent,
      {
        data: {
          block: this.block,
          blockEditor: this._blockEditor,
          blockGroup,
        },
      },
    )
      .afterClosed()
      .pipe(
        filter((block) => !!block),
        takeUntil(this._destroy$),
      );
  }

  public fontChanged(font) {
    this._blockEditor.selectedBlockComponentChangeProperty({ fontFamily: font });
  }

  public verticalAlignClick(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ verticalAlign: value });
  }

  public boldClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ bold: !this.block.bold });
  }

  public toggleLock(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ lock: !this.block.lock });
  }

  public fontColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ fontColor: value });
  }

  public italicClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ italic: !this.block.italic });
  }

  public underlineClick(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ underline: !this.block.underline });
  }

  public backgroundColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ backgroundColor: value });
  }

  public shadowColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ shadowColor: value });
  }

  public paddingAllChange(value): void {
    value = this.validNumeric(value) ? value : null;
    this.block.paddingTop = value;
    this.block.paddingLeft = value;
    this.block.paddingBottom = value;
    this.block.paddingRight = value;

    this._blockEditor.selectedBlocks
      .forEach((block: Block) => {
        this._blockEditor.blockChange(block);
      });
  }

  public paddingKeypress(event: KeyboardEvent, name): void {
    this.block.padding = null;
    this.numericInputKeypress(event, name);
  }

  public paddingAllKeypress(event: KeyboardEvent, unit = .1): void {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      this.block.padding = (this.block.padding) + ((event.code === 'ArrowDown' ? -1 : 1) * unit);

      this.paddingAllChange(this.block.padding);
    }
  }

  public borderColorChange(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ borderColor: value });
  }

  public toggleKeepRatio(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ keepRatio: !this.block.keepRatio });
  }

  public horizontalAlignClick(value): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ horizontalAlign: value });
  }

  public shapeRound(name): void {
    const value = this.block[name] === 'round' ? 'square' : 'round';
    this._blockEditor.selectedBlockComponentChangeProperty({ [name]: value });
  }

  public numberChange(value, name): void {
    value = this.validNumeric(value) ? value : null;
    this._blockEditor.selectedBlockComponentChangeProperty({ [name]: value });
  }

  public imageRemove(): void {
    this._blockEditor.selectedBlockComponentChangeProperty({ imageUrl: null });
  }

  public imageClip(): void {
    this.clippable = !this.clippable;
    this._blockEditor.blockClippable = true;
  }

  public blockChangeProperty(values): void {
    this._blockEditor.selectedBlockComponentChangeProperty(values);
  }

  public blockDuplicateClick() {
    const selectedBlock = this._blockEditor.selectedBlocks[0];
    const block = {
      ...selectedBlock,
      id: null,
      data: null,
      guid: null,
      top: selectedBlock.top + selectedBlock.height + .1,
    };

    this._blockEditor.blockAdd(block);
  }

  public blockRemoveClick() {
    this._blockEditor.removeBlocks(this._blockEditor.selectedBlocks);
  }

  public validate = (formControl: UntypedFormControl) => {
    if (this._blockEditor.config.defaultValidation) {
      return this._blockEditor.config.defaultValidation(this.block, formControl.value);
    }

    return of(true);
  };


  public blockUpload(block: Block, fsFile: FsFile): void {
    this._blockEditor.blockUpload(
      block,
      fsFile,
    )
      .subscribe();
  }

  public blockAdd(type: BlockType): void {
    if (type === BlockType.Pdf || type === BlockType.Image) {
      return;
    }

    const block: Block = {
      type,
      shadowX: 2,
      shadowY: 2,
      shadowBlur: 4,
    };

    this._blockEditor.blockAdd(block);
  }

  public layerMove(direction): void {
    this._blockEditor.blocks.forEach((block) => {
      if (this._blockEditor.isSelectedBlock(block)) {
        block.index += (999 * direction);
      }
    });

    const sorted = this._blockEditor.blocks
      .sort((a, b) => {
        return a.index > b.index ? 1 : -1;
      });

    sorted
      .forEach((block, idx) => {
        block.index = idx;
        this._blockEditor.blockChange(block);
      });

    if (this.config.blocksLevelChanged) {
      this.config.blocksLevelChanged(sorted.map((block) => block));
    }
  }

  public exportBlocks(): void {
    const blocks = this._blockEditor.blocks
      .map((block) => ({
        ...block,
        id: null,
        pdfPageId: null,
        guid: guid(),
        imageUrl: null,
      }));

    this._clipboard.copy(JSON.stringify(blocks), { showMessage: false });
    this._message.success('Exported blocks to clipboard');
  }

  public importBlocks(): void {
    this._prompt.input({
      title: 'Import blocks',
      label: 'Import blocks',
      required: true,
    })
      .pipe(
        catchError(() => of(null)),
        filter((blocks) => !!blocks),
      )
      .subscribe((blocks) => {
        blocks = JSON.parse(blocks);

        blocks
          .forEach((block: Block) => {
            this._blockEditor.blockAdd(block);
          });

        this._message
          .success(`Imported ${blocks.length} ${blocks.length === 1 ? 'block' : 'blocks'}`);
      });
  }

  public layerUp(): void {
    this.layerMove(1);
  }

  public layerDown(): void {
    this.layerMove(-1);
  }

  public inputFocus(event): void {
    event.target.select();
  }

  public numericInputKeypress(event: KeyboardEvent, name, unit = .1): void {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      this.block[name] = round(
        Number(this.block[name] || 0) +
        ((event.code === 'ArrowDown' ? -1 : 1) * unit),
        3);

      this._blockEditor.selectedBlockComponentChangeProperty({ [name]: this.block[name] });
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  public validNumeric(value): boolean {
    return !value || !!String(value).match(/^\d*\.?\d*$/);
  }
}
