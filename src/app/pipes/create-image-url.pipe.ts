import { Pipe, PipeTransform } from '@angular/core';

import { FsApi } from '@firestitch/api';


@Pipe({ name: 'createImageUrl' })
export class CreateImageUrlPipe implements PipeTransform {

  public constructor(
    private _api: FsApi,
  ) { }

  public transform(url) {
    return this._api.createApiFile(url).safeDataUrl;
  }
}
