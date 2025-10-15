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

  backPage(): void {
    if (this.current_page === 1) {
      return;
    } else {
      this.current_page--;
    }
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

  getNewMovies(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.baseUrl}/movies`);
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

  getFilteredData(type: string, genre: string, country: string, year: string, page: number = 1): Observable<Film[]> {
    return this.http.get<Film[]>(
      `${this.baseUrl}/filtered-content?type=${type}&genre=${genre}&country=${country}&year=${year}&page=${page}`
    );
  }
}