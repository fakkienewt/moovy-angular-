import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Film } from '../models.ts/film.model';
import { Filter } from '../models.ts/filter.model';

@Injectable({
  providedIn: 'root'
})
export class Service {

  constructor(private http: HttpClient) { }

  private baseUrl = 'http://localhost:3500/api';
  public current_page: number = 1;
  public filter_year: number;

  public new_film_page: number = 1;
  public all_new_films: Film[] = [];
  private current_start_index: number = 0;

  backPage(): void {
    if (this.current_page === 1) {
      return;
    } else {
      this.current_page--;
    }
  }

  nextNewFilmPage(): void {
    if (this.current_start_index + 4 < this.all_new_films.length) {
      this.current_start_index++;
    }
  }

  backNewFilmPage(): void {
    if (this.current_start_index > 0) {
      this.current_start_index--;
    }
  }

  getCurrentFilms(): Film[] {
    return this.all_new_films.slice(this.current_start_index, this.current_start_index + 4);
  }

  resetPage(): void {
    this.current_page = 1;
  }

  nextPage(): void {
    this.current_page++;
  }

  setPage(page: number): void {
    if (page >= 1) {
      this.current_page = page;
    }
  }

  getNewFilms(): Observable<Film[]> {  
    return this.http.get<Film[]>(`${this.baseUrl}/films?page=${this.new_film_page}`);
  }

  getFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.baseUrl}/films?page=${this.current_page}`);
  }

  getSeries(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.baseUrl}/series?page=${this.current_page}`);
  }

  getDorama(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.baseUrl}/dorama?page=${this.current_page}`);
  }

  getAnime(): Observable<Film[]> {
    if (this.filter_year) {
      return this.http.get<Film[]>(`${this.baseUrl}/anime?page=${this.current_page}&year=${this.filter_year}`);
    } else {
      return this.http.get<Film[]>(`${this.baseUrl}/anime?page=${this.current_page}`);
    }
  }

  getFilterData(): Observable<Filter> {
    return this.http.get<Filter>(`${this.baseUrl}/filters`);
  }

  getFilteredData(type: string, genre: string, country: string, year: string, page: number = 1, sort: string = 'default'): Observable<Film[]> {
    return this.http.get<Film[]>(
      `${this.baseUrl}/filtered-content?type=${type}&genre=${genre}&country=${country}&year=${year}&page=${page}&sort=${sort}`
    );
  }

  getSearchData(title: string) {
    return this.http.get<any>(`${this.baseUrl}/search?title=${title}`);
  }

  getSimilarFilms(genres: string | undefined, type: string | undefined): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.baseUrl}/similar?genres=${genres}&type=${type}`);
  }
}