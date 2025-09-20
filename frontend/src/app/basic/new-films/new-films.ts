import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { NewFilmsService } from '../../services/new-films-service';

@Component({
  selector: 'app-new-films',
  standalone: false,
  templateUrl: './new-films.html',
  styleUrl: './new-films.scss'
})
export class NewFilms implements OnInit {

  moviesList$: Observable<Film[]> = of([]);
  loading$ = true;

  constructor(
    private _newMoviesService: NewFilmsService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.moviesList$ = this._newMoviesService.moviesList$;
    this._newMoviesService.load();
    this._newMoviesService.loading$.subscribe(loading => {
      this.loading$ = loading;
    });
  }

  getPosterUrl(poster: string | null | undefined): string {
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

  onClickPage(movie: Film) {
    this.router.navigate([`movie/${movie.id}`], {
      state: { movie: movie }
    });
  }
}
