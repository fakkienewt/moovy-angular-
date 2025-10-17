import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../../services/service';
import { Film } from '../../models.ts/film.model';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  anime: Film[] = [];
  dorama: Film[] = [];
  serie: Film[] = [];
  film: Film[] = [];

  searchResults: any;

  constructor(
    public router: Router,
    public service: Service
  ) { };

  onClickMain() {
    this.router.navigate(['/']);
  }

  onSearchClick(value: string): void {

    if (!value || value.trim().length === 0) {
      this.searchResults = null;
      this.toggleBodyScroll(true);
      return;
    }

    this.toggleBodyScroll(false);
    this.service.getSearchData(value).subscribe({
      next: (data) => {
        if (data && typeof data === 'object') {
          this.searchResults = [
            ...(data.anime || []),
            ...(data.dorama || []),
            ...(data.series || []),
            ...(data.films || [])
          ];
        } else {
          this.searchResults = [];
        }
        console.log('Search results:', this.searchResults);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
      }
    });
  }

  getPosterUrlFilm(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  closeSearchWindow(): void {
    this.searchResults = null;
    this.toggleBodyScroll(true);
  }

  private toggleBodyScroll(enable: boolean) {
    if (enable) {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  onTheNewPage(item: Film): void {
    if (item.type === 'film') {
      this.router.navigate([`films/${item.id}`], {
        state: { movie: item }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    } else if (item.type === 'anime') {
      this.router.navigate([`anime/${item.id}`], {
        state: { anime: item }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    } else if (item.type === 'dorama') {
      this.router.navigate([`dorama/${item.id}`], {
        state: { dorama: item }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    } else if (item.type === 'serie') {
      this.router.navigate([`series/${item.id}`], {
        state: { series: item }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    }
    this.closeSearchWindow();
  }
}