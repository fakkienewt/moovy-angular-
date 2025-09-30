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

  films: Film[] = [];
  seriesList: Film[] = [];
  dorama: Film[] = [];
  anime: Film[] = [];

  error = false;
  loading = true;
  activeTab: string = 'films';
  loading_pagination: boolean;

  loadingFilms = true;
  loadingSeries = true;
  loadingDorama = true;
  loadingAnime = true;

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

  loadCategoryData(category: string,): void {
    switch (category) {
      case 'films':
        this.loadFilms();
        this.loadFilmsWithPagination();
        break;
      case 'series':
        this.loadSeries();
        this.loadSeriesWithPagination();
        break;
      case 'dorama':
        this.loadDorama();
        this.loadDoramaWithPagination();
        break;
      case 'anime':
        this.loadAnime();
        this.loadAnimeWithPagination();
        break;
    }
  }

  onPageChanged(newPage: number): void {
    this.MainService.setPage(newPage);
    if (this.activeTab === 'films') {
      this.loadFilmsWithPagination();
    }

    if (this.activeTab === 'series') {
      this.loadSeriesWithPagination();
    }

    if (this.activeTab === 'dorama') {
      this.loadDoramaWithPagination();
    }

    if (this.activeTab === 'anime') {
      this.loadAnimeWithPagination();
    }
  }

  loadFilmsWithPagination(): void {
    this.loading_pagination = true;
    this.films = [];

    this.MainService.getFilms().subscribe({
      next: (data: Film[]) => {
        this.films = data;
        this.loading_pagination = false;
      }
    });
  }

  loadSeriesWithPagination(): void {
    this.loading_pagination = true;
    this.seriesList = [];

    this.MainService.getSeries().subscribe({
      next: (data: Film[]) => {
        this.seriesList = data;
        this.loading_pagination = false;
      }
    });
  }

  loadDoramaWithPagination(): void {
    this.loading_pagination = true;
    this.dorama = [];

    this.MainService.getDorama().subscribe({
      next: (data: Film[]) => {
        this.dorama = data;
        this.loading_pagination = false;
      }
    })
  }

  loadAnimeWithPagination(): void {
    this.loading_pagination = true;
    this.anime = [];

    this.MainService.getAnime().subscribe({
      next: (data: Film[]) => {
        this.anime = data;
        this.loading_pagination = false;
      }
    })
  }

  loadFilms(): void {
    this.loadingFilms = true;
    this.MainService.getFilms().subscribe({
      next: (data: Film[]) => {
        this.films = data;
        this.loading = false;
        this.loadingFilms = false;
      },
      error: (error: any) => {
        console.error(error);
        this.error = true;
        this.loadingFilms = false;
      }
    })
  }

  loadSeries(): void {
    this.loadingSeries = true;
    this.MainService.getSeries().subscribe({
      next: (data: Film[]) => {
        this.seriesList = data;
        this.loading = false;
        this.loadingSeries = false;
      },
      error: (error: any) => {
        console.log(error);
        this.error = true;
        this.loadingSeries = false;
      }
    });
  }

  loadDorama(): void {
    this.loadingDorama = true;
    this.MainService.getDorama().subscribe({
      next: (data: Film[]) => {
        this.dorama = data;
        this.loading = false;
        this.loadingDorama = false;
      },
      error: (error: any) => {
        console.log(error);
        this.error = true;
        this.loadingDorama = false;
      }
    });
  }

  loadAnime(): void {
    this.loadingAnime = true;
    this.MainService.getAnime().subscribe({
      next: (data: Film[]) => {
        this.anime = data;
        this.loading = false;
        this.loadingAnime = false;
      },
      error: (error: any) => {
        console.log(error);
        this.error = true;
        this.loadingAnime = false;
      }
    });
  }

  getPosterUrlFilm(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';

    let cleanPoster = poster.replace(/^['"]|['"]$/g, '').trim();
    const bgMatch = cleanPoster.match(/url\(['"]?(.*?)['"]?\)/);

    if (bgMatch && bgMatch[1]) {
      cleanPoster = bgMatch[1];
    }

    cleanPoster = cleanPoster.split(',')[0].trim();

    if (cleanPoster.startsWith('http')) {
      return cleanPoster;
    }
    return '/assets/default-poster.jpg';
  }

  onClickPageFilm(film: Film): void {
    this.router.navigate([`films/${film.id}`], {
      state: { movie: film }
    });
  }

  onClickPageSeries(series: Film) {
    this.router.navigate([`series/${series.id}`], {
      state: { series: series }
    });
  }

  onClickPageDorama(dorama: Film) {
    this.router.navigate([`dorama/${dorama.id}`], {
      state: { dorama: dorama }
    });
  }

  onClickPageAnime(anime: Film) {
    this.router.navigate([`anime/${anime.id}`], {
      state: { anime: anime }
    });
  }
}

