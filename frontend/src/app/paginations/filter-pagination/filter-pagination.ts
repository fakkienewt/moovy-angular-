import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-pagination',
  standalone: false,
  templateUrl: './filter-pagination.html',
  styleUrl: './filter-pagination.scss'
})
export class FilterPagination {
  @Input() currentPage: number = 1;
  @Input() hasMoreContent: boolean = true;
  @Output() pageChanged = new EventEmitter<number>();

  onBack(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage);
    }
  }

  onNext(): void {
    if (this.hasMoreContent) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage);
    }
  }
}
