import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { Service } from '../../services/service';

@Component({
  selector: 'app-new-films',
  standalone: false,
  templateUrl: './new-films.html',
  styleUrl: './new-films.scss'
})
export class NewFilms implements OnInit {

  loading = true;
  movies: Film[] = [];

  constructor(
    public router: Router,
    private service: Service,
  ) { }

  ngOnInit(): void {
    this.loadFilms();
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  onClickPage(movie: Film) {
    this.router.navigate([`films/${movie.id}`], {
      state: { movie: movie }
    });
  }

  onClickNext(): void {
    this.service.nextNewFilmPage();
    this.movies = this.service.getCurrentFilms();
  }

  onClickPrev(): void {
    this.service.backNewFilmPage();
    this.movies = this.service.getCurrentFilms();
  }

  loadFilms(): void {
    this.loading = true;
    this.service.getNewFilms().subscribe({
      next: (data: Film[]) => {
        this.service.all_new_films = data.slice(0, 9);
        this.movies = this.service.getCurrentFilms();
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
      }
    });
  }
}