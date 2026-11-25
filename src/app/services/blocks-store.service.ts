import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Block } from '../interfaces/block';


enum EventType {
  Add = 'add',
  Change = 'change',
  Remove = 'remove',
  Update = 'update',
}

@Injectable()
export class BlocksStore implements OnDestroy {

  private _eventBus$ = new Subject<{ type: EventType; value: Block }>();
  private _blocks$ = new BehaviorSubject<Block[]>([]);
  private _destroy$ = new Subject<void>();

  public get blocks(): Block[] {
    return [
      ...this._blocks$.getValue(),
    ];
  }

  public get blocks$(): Observable<Block[]> {
    return this._blocks$.asObservable();
  }

  // The layer above every box: where a box added to the page goes
  public get nextIndex(): number {
    return this.blocks
      .reduce((highest: number, block: Block) => Math.max(highest, block.index), -1) + 1;
  }

  public get blockAdded$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Add),
        map(({ value }) => value),
      );
  }

  public get blockChanged$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Change),
        map(({ value }) => value),
      );
  }

  public get blockUpdated$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Update),
        map(({ value }) => value),
      );
  }

  public get blockRemoved$(): Observable<Block> {
    return this._eventBus$
      .pipe(
        filter(({ type }) => type === EventType.Remove),
        map(({ value }) => value),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  public init(blocks: Block[]): void {
    blocks
      .forEach((block) => {
        this._appendBlock(block);
      });
  }

  public blockExists(block: Block) {
    const index = this.blocks.findIndex((b) => {
      return b.guid === block.guid;
    });

    return index !== -1;
  }

  public blockAdd(block: Block): void {
    this._appendBlock(block);
  }

  public blockChange(block: Block): void {
    this._dispatchEvent(EventType.Change, block);
  }

  public blockUpdate(block: Block): void {
    this._dispatchEvent(EventType.Update, block);
  }

  public blockRemove(targetBlocks: Block | Block[]): void {
    const blocks = this.blocks;

    if (!Array.isArray(targetBlocks)) {
      targetBlocks = [targetBlocks];
    }

    targetBlocks.forEach((block) => {
      const index = blocks
        .findIndex((b) => b.guid === block.guid);

      if (index !== -1) {
        blocks.splice(index, 1);

        this._dispatchEvent(EventType.Remove, block);
      }
    });

    this._setBlocks(blocks);
  }

  private _setBlocks(blocks: Block[]): void {
    this._blocks$.next([...blocks]);
  }

  private _appendBlock(block: Block) {
    // A box keeps the layer it was saved with, the one a print of the page draws it
    // at: numbering it by its place in the list would save that number on its next
    // change. A box saved without a layer is on layer 0, as the print draws it.
    block.index = Number(block.index) || 0;

    this._setBlocks([
      ...this.blocks,
      block,
    ]);
    this._dispatchEvent(EventType.Add, block);
  }

  private _dispatchEvent(type: EventType, value: Block): void {
    this._eventBus$.next({
      type,
      value,
    });
  }
}
