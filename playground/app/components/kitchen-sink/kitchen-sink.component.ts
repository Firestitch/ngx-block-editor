import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';

import { BlockType } from '@firestitch/package';

import { Observable, of, throwError } from 'rxjs';

import { Block } from 'src/app/interfaces/block';

import { FsBlockEditorComponent } from './../../../../src/app/components/block-editor/block-editor.component';
import { BlockEditorConfig } from './../../../../src/app/interfaces/block-editor-config';


@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.component.html',
  styleUrls: ['./kitchen-sink.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitchenSinkComponent implements OnInit {

  @ViewChild(FsBlockEditorComponent)
  public blockEditor: FsBlockEditorComponent;

  public config: BlockEditorConfig = {};
  public selectedBlocks: Block[] = [];

  public ngOnInit(): void {
    this.config = {
      unit: 'in',
      width: 8.5,
      height: 11,
      marginTop: 1,
      marginRight: 1,
      marginBottom: 1,
      marginLeft: 1,
      defaultValidation: (block: Block, value) => {
        if (block.type === BlockType.Date) {
          if (value && value !== 'today') {
            return throwError('Invalid default value');
          }
        }

        return of(true);
      },
      blocks: this.getBlocks(),
      blockChange: (block) => {
        console.log('Block Changed', block);
      },
      blockAdd: (block) => {
        console.log('Block Add', block);

        return of(block);
      },
      blocksSelect: (blocks) => {
        this.selectedBlocks = blocks;
        console.log('Blocks Selected', blocks);
      },
      blocksRemove: (blocks) => {
        console.log('Blocks Removed', blocks);

        return of(blocks);
      },
      blocksReorder: (blocks) => {
        console.log('Blocks Reordered', blocks);

        return of(blocks);
      },
      blockUpload: (block, file: Blob): Observable<Block> => {
        console.log('Blocks Upload', block);

        return new Observable((observer) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            observer.next({
              ...block,
              imageUrl: String(reader.result),
            });
            observer.complete();
          };
        });
      },
    };

  }

  public blockChanged(event): void {
    console.log(event);
  }

  public getBlocks(): Block[] {
    //return [{ "top": 2.09, "left": 1, "width": 0.25, "height": 0.25, "type": BlockType.RadioButton, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "top", "horizontalAlign": "left", "index": 0, "guid": "2vdcdfrndqqj", "keepRatio": true, "resizable": false, "rotatable": false, "scalable": false, "shadowOpacity": 100, "name": "djjrag", "label": "Radio Group", "required": true, "readonly": false, "description": "Description" }, { "top": 2.45, "left": 1, "width": 0.25, "height": 0.25, "type": BlockType.RadioButton, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "top", "horizontalAlign": "left", "index": 1, "guid": "ai5mkvmn9qul", "keepRatio": true, "resizable": false, "rotatable": false, "scalable": false, "shadowOpacity": 100, "name": "djjrag", "label": "Radio Group", "description": "Description", "required": true }, { "top": 3.22, "left": 1, "width": 0.25, "height": 0.25, "type": BlockType.Checkbox, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "top", "horizontalAlign": "left", "index": 2, "guid": "48hv119ac4ln", "keepRatio": true, "resizable": false, "rotatable": false, "scalable": false, "shadowOpacity": 100, "name": "5ivfjd", "description": "Description", "label": "Checkbox Group", "required": false }, { "top": 3.58, "left": 1, "width": 0.25, "height": 0.25, "type": BlockType.Checkbox, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "top", "horizontalAlign": "left", "index": 3, "guid": "7t6u86o4pm77", "keepRatio": true, "resizable": false, "rotatable": false, "scalable": false, "shadowOpacity": 100, "name": "5ivfjd", "description": "Description", "label": "Checkbox Group", "required": false }, { "top": 2.09, "left": 1.36, "width": 1.5, "height": 0.25, "type": BlockType.Rectangle, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "center", "horizontalAlign": "left", "index": 4, "guid": "3e7wn9bf29w9", "keepRatio": false, "borderColor": "#cccccc", "borderWidth": 0, "resizable": true, "rotatable": true, "scalable": true, "shadowOpacity": 100, "content": "Radio A" }, { "top": 2.45, "left": 1.36, "width": 1.43, "height": 0.25, "type": BlockType.Rectangle, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "center", "horizontalAlign": "left", "index": 5, "guid": "wlfa2mtwiyh0", "keepRatio": false, "borderColor": "#cccccc", "borderWidth": 0, "resizable": true, "rotatable": true, "scalable": true, "shadowOpacity": 100, "content": "Radio B" }, { "top": 3.22, "left": 1.36, "width": 1.56, "height": 0.25, "type": BlockType.Rectangle, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "center", "horizontalAlign": "left", "index": 6, "guid": "u3kzb9xvt21r", "keepRatio": false, "borderColor": "#cccccc", "borderWidth": 0, "resizable": true, "rotatable": true, "scalable": true, "shadowOpacity": 100, "content": "Checkbox A" }, { "top": 3.58, "left": 1.36, "width": 1.48, "height": 0.25, "type": BlockType.Rectangle, "shadowX": 2, "shadowY": 2, "shadowBlur": 4, "shapeBottomLeft": "round", "shapeTopLeft": "round", "shapeTopRight": "round", "shapeBottomRight": "round", "verticalAlign": "center", "horizontalAlign": "left", "index": 7, "guid": "prylvqg32eew", "keepRatio": false, "borderColor": "#cccccc", "borderWidth": 0, "resizable": true, "rotatable": true, "scalable": true, "shadowOpacity": 100, "content": "Checkbox B" }];


    return [
      { width: 3, height: 2, top: .5, left: 4, keepRatio: true, imageUrl: '/assets/dog-puppy-on-garden-royalty-free-image-1586966191.jpg', type: BlockType.Rectangle, guid: '4f34523' },
      { width: 4, height: 2, top: 3, left: 3, borderColor: 'pink', content: 'Block A', padding: .1, borderWidth: 5, type: BlockType.Rectangle, fontFamily: 'Alfa Slab One', fontSize: 17, rotate: 45, guid: '36h5645' },
      { width: 5, height: 2.5, top: 6, left: 1, content: 'Block', backgroundColor: '#628597', fontColor: '#ffffff', paddingLeft: .2, paddingRight: .2, paddingTop: .2, paddingBottom: .2, type: BlockType.Rectangle, guid: '2fd5324' },
      { top: 2.09, left: 1, width: 0.25, height: 0.25, type: BlockType.RadioButton, shadowX: 2, shadowY: 2, shadowBlur: 4, shapeBottomLeft: 'round', shapeTopLeft: 'round', shapeTopRight: 'round', shapeBottomRight: 'round', verticalAlign: 'top', horizontalAlign: 'left', index: 0, guid: '2vdcdfrndqqj', keepRatio: true, resizable: false, rotatable: false, scalable: false, shadowOpacity: 100, name: 'djjrag', label: 'Radio Group', required: false, readonly: false, description: 'Description' },
      { top: 2.45, left: 1, width: 0.25, height: 0.25, type: BlockType.RadioButton, shadowX: 2, shadowY: 2, shadowBlur: 4, shapeBottomLeft: 'round', shapeTopLeft: 'round', shapeTopRight: 'round', shapeBottomRight: 'round', verticalAlign: 'top', horizontalAlign: 'left', index: 1, guid: 'ai5mkvmn9qul', keepRatio: true, resizable: false, rotatable: false, scalable: false, shadowOpacity: 100, name: 'djjrag', label: 'Radio Group', description: 'Description' },
    ];

  }
}
