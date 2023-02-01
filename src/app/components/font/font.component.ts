import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ElementRef, Input,
  OnInit,
} from '@angular/core';
import { GoogleFontService } from 'src/app/services';


@Component({
  selector: 'app-font',
  templateUrl: 'font.component.html',
  styleUrls: [ 'font.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontComponent implements OnInit {

  @Input() public font;

  constructor(
    private _el: ElementRef,
    private _cdRef: ChangeDetectorRef,
    private _googleFontService: GoogleFontService,
  ) {}

  public ngOnInit(): void {
    var observer = new IntersectionObserver((entries) => {
      // isIntersecting is true when element and viewport are overlapping
      // isIntersecting is false when element and viewport don't overlap
      if(entries[0].isIntersecting === true) {
        this._googleFontService.loadFont(this.font);
      }
    }, { threshold: [0] });
    
    observer.observe(this._el.nativeElement);
  }
}
