import { Component, OnInit } from '@angular/core';
import { FooterService } from './services/footer.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {

  isFooterVisible$!: Observable<boolean>;


  constructor(private footerService: FooterService) { }

  ngOnInit() {
    this.isFooterVisible$ = this.footerService.isVisible$;
  }
}
