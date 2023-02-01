import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class GoogleFontService {

    private _fonts$: BehaviorSubject<{ family: string }[]>;
    private _apiKey: string = 'AIzaSyAoT2RLzCSFUb148F4uLXyAuquAzjcjyGk';

    constructor(
      private httpClient: HttpClient
    ) {}

    public loadFont(font) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family}&family=Tangerine&display=swap`;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    public getItems(): Observable<{ family: string }[]> {
      if (this._fonts$) {
          return this._fonts$.asObservable();
      }

      if (!this._apiKey) {
          return throwError(`Error: api key was not provided to the google fonts service`);
      }

      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${this._apiKey}`;
      return this.httpClient.get<{ items: any[] }>(url)
        .pipe(
          map((response) => response.items
            .map((item) => {
              return { family: item.family };
            }),
          ),
        );
    }
}