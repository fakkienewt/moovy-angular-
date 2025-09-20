import { Component, EventEmitter, Output } from '@angular/core';
import { Service } from '../../services/service';

@Component({
  selector: 'app-main-pagination',
  standalone: false,
  templateUrl: './main-pagination.html',
  styleUrl: './main-pagination.scss'
})
export class MainPagination {

  constructor(
    private service: Service
  ) { }

  @Output() pageChanged = new EventEmitter<number>();

  backPage(): void {
    this.service.backPage();
    this.pageChanged.emit(this.service.current_page);
  }

  nextPage(): void {
    this.service.nextPage();
    this.pageChanged.emit(this.service.current_page);
  }
  
  get current_page(): number {
    return this.service.current_page;
  }
}
