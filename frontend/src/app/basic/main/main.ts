import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { Service } from '../../services/service';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {

  films: Film[] = []
  seriesList: Film[] = [];
  dorama: Film[] = [];
  anime: Film[] = [];

  activeTab: string = 'films';
  loading: boolean = true;
  loading_pagination: boolean = false;
  loadingFilms: boolean = true;
  loadingSeries: boolean = true;
  loadingDorama: boolean = true;
  loadingAnime: boolean = true;

  constructor(
    private MainService: Service,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.setActiveTab('films');
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.MainService.resetPage();
    this.loadCategoryData(tab);
  }

  loadCategoryData(category: string): void {
    this.loading = true;
    this.loading_pagination = false;

    switch (category) {
      case 'films':
        this.loadingFilms = true;
        this.loadFilms();
        break;
      case 'series':
        this.loadingSeries = true;
        this.loadSeries();
        break;
      case 'dorama':
        this.loadingDorama = true;
        this.loadDorama();
        break;
      case 'anime':
        this.loadingAnime = true;
        this.loadAnime();
        break;
    }
  }

  onPageChanged(newPage: number): void {
    this.MainService.setPage(newPage);
    this.loading_pagination = true;

    switch (this.activeTab) {
      case 'films':
        this.loadFilms();
        break;
      case 'series':
        this.loadSeries();
        break;
      case 'dorama':
        this.loadDorama();
        break;
      case 'anime':
        this.loadAnime();
        break;
    }
  }

  loadFilms(): void {
    this.MainService.getFilms().subscribe({
      next: (data: Film[]) => {
        this.films = data;
        this.loading = false;
        this.loading_pagination = false;
        this.loadingFilms = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
        this.loading_pagination = false;
        this.loadingFilms = false;
      }
    });
  }

  loadSeries(): void {
    this.MainService.getSeries().subscribe({
      next: (data: Film[]) => {
        this.seriesList = data;
        this.loading = false;
        this.loading_pagination = false;
        this.loadingSeries = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
        this.loading_pagination = false;
        this.loadingSeries = false;
      }
    });
  }

  loadDorama(): void {
    this.MainService.getDorama().subscribe({
      next: (data: Film[]) => {
        this.dorama = data;
        this.loading = false;
        this.loading_pagination = false;
        this.loadingDorama = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
        this.loading_pagination = false;
        this.loadingDorama = false;
      }
    });
  }

  loadAnime(): void {
    this.MainService.getAnime().subscribe({
      next: (data: Film[]) => {
        this.anime = data;
        this.loading = false;
        this.loading_pagination = false;
        this.loadingAnime = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
        this.loading_pagination = false;
        this.loadingAnime = false;
      }
    });
  }

  getPosterUrlFilm(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  onClickPageFilm(film: Film): void {
    this.router.navigate([`films/${film.id}`], {
      state: { movie: film }
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }

  onClickPageSeries(series: Film): void {
    this.router.navigate([`series/${series.id}`], {
      state: { series: series }
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }

  onClickPageDorama(dorama: Film): void {
    this.router.navigate([`dorama/${dorama.id}`], {
      state: { dorama: dorama }
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }

  onClickPageAnime(anime: Film): void {
    this.router.navigate([`anime/${anime.id}`], {
      state: { anime: anime }
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }
}