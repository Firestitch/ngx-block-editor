import { Pipe, PipeTransform, inject } from '@angular/core';

import { FsApi } from '@firestitch/api';


@Pipe({
    name: 'createImageUrl',
    standalone: true
})
export class CreateImageUrlPipe implements PipeTransform {
  private _api = inject(FsApi);


  public transform(url) {
    return this._api.createApiFile(url).safeDataUrl;
  }
}
