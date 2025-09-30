import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Film } from '../models.ts/film.model';
@Injectable({
  providedIn: 'root'
})
export class Service {

  constructor(private http: HttpClient) { }

  private baseUrl = 'http://localhost:3500/api';
  public current_page: number = 1;

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
    return this.http.get<Film[]>(`${this.baseUrl}/anime?page=${this.current_page}`);
  }
}