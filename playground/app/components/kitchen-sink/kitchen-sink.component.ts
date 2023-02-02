import { FsBlockEditorComponent } from './../../../../src/app/components/block-editor/block-editor.component';
import { BlockEditorConfig } from './../../../../src/app/interfaces/block-editor-config';
import { Component, OnInit, ViewChild } from '@angular/core';
import { KitchenSinkConfigureComponent } from '../kitchen-sink-configure';
import { FsExampleComponent } from '@firestitch/example';
import { FsMessage } from '@firestitch/message';
import { Block } from 'src/app/interfaces/block';
import { Observable, of } from 'rxjs';
import { BlockType } from '@firestitch/package';

@Component({
  selector: 'kitchen-sink',
  templateUrl: 'kitchen-sink.component.html',
  styleUrls: ['kitchen-sink.component.scss']
})
export class KitchenSinkComponent implements OnInit {

  @ViewChild(FsBlockEditorComponent)
  public blockEditor: FsBlockEditorComponent;

  public config: BlockEditorConfig = {};
  public selectedBlocks: Block[] = [];

  constructor(
    private exampleComponent: FsExampleComponent,
    private message: FsMessage,
  ) {
    exampleComponent.setConfigureComponent(KitchenSinkConfigureComponent, { config: this.config });
  }

  public ngOnInit(): void {

    const blocks: Block[] = [
      { width: 4, height: 2, top: 2, left: 3, borderColor: 'pink', content: 'Block A', padding: .1, borderWidth: 5, type: BlockType.Rectangle },
      { width: 5, height: 2.5, top: 4, left: 1, content: 'Block', backgroundColor: '#628597', fontColor: '#ffffff', paddingLeft: .2, paddingRight: .2, paddingTop: .2, paddingBottom: .2, type: BlockType.Rectangle  },
    ];

    this.config = {
      unit: 'in',
      width: 8.5,
      height: 11,
      marginTop: 1,
      marginRight: 1,
      marginBottom: 1,
      marginLeft: 1,
      blocks: blocks,
      blockChanged: (block) => {
        console.log('Block Changed', block);
      },
      blockAdd: (block) => {
        console.log('Block Add', block);
        return of(block);
      },
      blocksSelected: (blocks) => {
        this.selectedBlocks = blocks;
        console.log('Blocks Selected', blocks);
      },
      blocksRemove: (blocks) => {
        console.log('Blocks Removed', blocks);
        return of(blocks);
      },
      imageUpload: (file: Blob): Observable<string> => {
        return new Observable((observer) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            observer.next(String(reader.result));
            observer.complete();
          }
        });
      },
      blockUpload: (block, file: Blob): Observable<Block> =>  {
        return new Observable((observer) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            observer.next({
              ...block,
              imageUrl: String(reader.result),
            });
            observer.complete();
          }
        });
      }
    }

  }

  public blockChanged(event): void {
    console.log(event);
  }
}


interface CustomBlock {
  mapping?: string;
}
