import { Injectable } from '@angular/core';
import { Service } from './service';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, tap } from "rxjs";
import { Film } from '../models.ts/film.model';

@Injectable({
  providedIn: 'root'
})
export class NewFilmsService {

  constructor(private _service: Service) { }

  private _moviesList$: BehaviorSubject<Film[]> = new BehaviorSubject<Film[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _x$ = new BehaviorSubject<number>(0);

  loading$ = this._loading$.asObservable();

  load(): void {
    this._service.getNewMovies().subscribe(result => {
      this._moviesList$.next(result);
      this._loading$.next(false);
    });
  }

  get moviesList$(): Observable<Film[]> {
    return combineLatest([
      this._moviesList$,
      this._x$,
    ]).pipe(
      map(([movies, x]) => movies.slice(x, x + 4)),

    );
  }

  moveRight(): void {
    if (!this.isNextEnabled()) {
      return;
    }
    this._x$.next(this._x$.value + 1);
  }

  moveLeft(): void {
    if (!this.isPrevEnabled()) {
      return;
    }
    this._x$.next(this._x$.value - 1);
  }

  private isPrevEnabled(): boolean {
    return this._x$.value > 0;
  }

  private isNextEnabled(): boolean {
    return this._x$.value < 4;
  }
}
