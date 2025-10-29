import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-pagination',
  standalone: false,
  templateUrl: './profile-pagination.html',
  styleUrl: './profile-pagination.scss'
})
export class ProfilePagination {
  @Input() currentPage: number = 1;     
  @Input() totalPages: number = 1;     
  @Output() changedPage = new EventEmitter<number>();

  backPage(): void {
    if (this.currentPage > 1) {
      this.changedPage.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changedPage.emit(this.currentPage + 1);
    }
  }
}
