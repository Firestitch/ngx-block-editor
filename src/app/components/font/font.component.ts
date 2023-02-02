import {
  ChangeDetectionStrategy, Component,
  ElementRef, Input,
  OnInit,
} from '@angular/core';
import { GoogleFontService } from '../../services/google-font.service';


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
    private _googleFontService: GoogleFontService,
  ) {}

  public ngOnInit(): void {
    var observer = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting === true) {
        this._googleFontService.loadFont(this.font);
      }
    }, { threshold: [0] });
    
    observer.observe(this._el.nativeElement);
  }
}
