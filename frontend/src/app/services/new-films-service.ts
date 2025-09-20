import { Injectable } from '@angular/core';
import { Service } from './service';
import { BehaviorSubject, Observable } from "rxjs";
import { Film } from '../models.ts/film.model';

@Injectable({
  providedIn: 'root'
})
export class NewFilmsService {

  constructor(private _service: Service) { }

  private _moviesList$: BehaviorSubject<Film[]> = new BehaviorSubject<Film[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(true);


  loading$ = this._loading$.asObservable();

  load(): void {
    this._service.getNewMovies().subscribe(result => {
      this._moviesList$.next(result);
      this._loading$.next(false);
    });
  }

  get moviesList$(): Observable<Film[]> {
    return this._moviesList$.asObservable();
  }
}
