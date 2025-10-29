import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Favorites } from '../models.ts/favorites.data.model';
import { Film } from '../models.ts/film.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public current_page: number = 1;

  constructor(private http: HttpClient) { }

  private baseUrl = 'http://localhost:3500/api';

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/registration`, { email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/profile`, { headers });
  }

  postFavorites(content: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.baseUrl}/favorites`, {
      content: content
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getFavorites(): Observable<Favorites> {
    const token = this.getToken();
    return this.http.get<Favorites>(`${this.baseUrl}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  checkIsFavorite(contentId: number, contentType: string): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}/checkIsFavorite`, {
      params: { contentId, contentType },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  removeFromFavorites(contentId: number, contentType: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.baseUrl}/favorites`, {
      params: {
        contentId: contentId.toString(),
        contentType
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getFilmById(id: number, type: string): Observable<any> {
    const token = this.getToken();
    return this.http.post<any>(`${this.baseUrl}/postID`, { id, type }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  postLater(content: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.baseUrl}/later`, {
      content: content
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getLater(): Observable<Favorites> {
    const token = this.getToken();
    return this.http.get<Favorites>(`${this.baseUrl}/later`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  removeFromLater(contentId: number, contentType: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.baseUrl}/later`, {
      params: {
        contentId: contentId.toString(),
        contentType
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}