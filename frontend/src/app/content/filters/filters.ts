import { Component, OnInit } from '@angular/core';
import { Service } from '../../services/service';
import { Filter } from '../../models.ts/filter.model';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filters',
  standalone: false,
  templateUrl: './filters.html',
  styleUrl: './filters.scss'
})
export class Filters implements OnInit {

  filter: Filter | null = null;

  selectedType: string = '';
  selectedGenre: string = '';
  selectedYear: string = '';
  selectedCountry: string = '';

  selectedSort: string = 'default';

  constructor(
    private service: Service,
    public router: Router
  ) { }

  currentPage: number = 1;
  foundedContent: Film[] = [];
  hasSearched: boolean = false;
  hasMoreContent: boolean = true;

  ngOnInit(): void {
    this.printData();
  }

  printData(): void {
    this.service.getFilterData().subscribe({
      next: (data: Filter) => {
        this.filter = data;
      },
      error: (error: any) => {
        console.error('ERROR:', error);
      }
    });
  }

  onApply(): void {

    if (this.selectedCountry === '' && this.selectedType === '' && this.selectedGenre === '' && this.selectedYear === '') {
      return;
    }

    if (!this.selectedType) {
      return;
    }

    this.currentPage = 1;
    this.hasSearched = true;

    this.service.getFilteredData(
      this.selectedType,
      this.selectedGenre,
      this.selectedCountry,
      this.selectedYear,
      this.currentPage,
      this.selectedSort
    ).subscribe({
      next: (data: Film[]) => {
        this.foundedContent = data;
        this.checkNextPage();
      },
      error: (error) => {
        console.error('ERRORR:', error);
      }
    })
  }

  checkNextPage(): void {
    this.service.getFilteredData(
      this.selectedType,
      this.selectedGenre,
      this.selectedCountry,
      this.selectedYear,
      this.currentPage + 1,
      this.selectedSort
    ).subscribe({
      next: (nextPageData: Film[]) => {
        this.hasMoreContent = nextPageData.length > 0;
      },
      error: (error) => {
        this.hasMoreContent = false;
      }
    });
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadFilteredContent();
  }

  private loadFilteredContent(): void {
    this.service.getFilteredData(
      this.selectedType,
      this.selectedGenre,
      this.selectedCountry,
      this.selectedYear,
      this.currentPage,
      this.selectedSort
    ).subscribe({
      next: (data: Film[]) => {
        this.foundedContent = data;
        console.log('Найдено фильмов:', data.length);
        this.checkNextPage();
      },
      error: (error) => {
        console.error('Ошибка при поиске:', error);
      }
    });
  }

  onReset(): void {
    this.selectedType = '';
    this.selectedGenre = '';
    this.selectedYear = '';
    this.selectedCountry = '';
    this.foundedContent = [];
    this.currentPage = 1;
    this.hasSearched = false;
    this.hasMoreContent = true;
  }

  getPosterUrlFilm(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }


  onClickPage(film: Film): void {
    if (this.selectedType === 'anime') {
      this.router.navigate([`anime/${film.id}`], {
        state: { anime: film }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    }

    if (this.selectedType === 'dorama') {
      this.router.navigate([`dorama/${film.id}`], {
        state: { dorama: film }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    }

    if (this.selectedType === 'serie') {
      this.router.navigate([`series/${film.id}`], {
        state: { series: film }
      }).then(() => {
        window.location.reload();
      }).then(() => {
        window.scrollTo(0, 0);
      });
    }

    if (this.selectedType === 'film') {
      this.router.navigate([`films/${film.id}`], {
        state: { movie: film }
      }).then(() => {
        window.scrollTo(0, 0);
      }).then(() => {
        window.location.reload();
      })
    }
  }

  onSortChange(sortType: string): void {
    this.selectedSort = sortType;
    this.currentPage = 1;

    this.service.getFilteredData(
      this.selectedType,
      this.selectedGenre,
      this.selectedCountry,
      this.selectedYear,
      this.currentPage,
      this.selectedSort
    ).subscribe({
      next: (data: Film[]) => {
        this.foundedContent = data;
        this.checkNextPage();
      },
      error: (error) => {
        console.error('Ошибка при сортировке:', error);
      }
    });
  }
}