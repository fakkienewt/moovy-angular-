import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { Film } from '../../models.ts/film.model';
import { Favorites } from '../../models.ts/favorites.data.model';
import { Router } from '@angular/router';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {

  favorites: Film[] = [];
  userImage: string | null = null;
  userNickname: string = '';
  isLoading: boolean = false;

  activeTab: string = 'favorites';

  constructor(
    private profileService: ProfileService,
    public router: Router,
    public favorites_sync_service: FavoritesSyncService
  ) { }

  loadCategoryData(category: string): void {
    this.activeTab = category;

    switch (category) {
      case 'favorites':
        console.log('favorites');
        this.getFavorites();
        break;
      case 'watched':
        console.log('watched');
        break;
      case 'watchLater':
        console.log('watchLater');
        break;
      case 'comments':
        console.log('comments');
        break;
    }
  }
  ngOnInit(): void {
    this.getFavorites();
  }

  getFavorites(): void {
    this.isLoading = true;
    this.profileService.getFavorites().subscribe({
      next: (response: Favorites | Film[]) => {
        if (Array.isArray(response)) {
          this.favorites = response;
        } else if (response && 'data' in response && Array.isArray(response.data)) {
          this.favorites = response.data;
        } else if (response && 'favorites' in response && Array.isArray(response.favorites)) {
          this.favorites = response.favorites;
        } else {
          this.favorites = [];
          console.warn('Неизвестный формат ответа:', response);
        }
        this.isLoading = false;
        console.log('Избранное:', this.favorites);
      },
      error: (error) => {
        console.error('Ошибка при получении избранного:', error);
        this.favorites = [];
        this.isLoading = false;
      }
    });
  }

  getPosterUrl(posterPath: string | undefined): string {
    if (!posterPath) return '/assets/images/default-poster.jpg';
    return posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  onClickPage(film: any): void {
    console.log('Кликнули на фильм:', film);

    this.profileService.getFilmById(film.content_id, film.content_type).subscribe({
      next: (response: any) => {
        if (response.success) {
          const fullFilmData = response.data;

          let routePath = '';

          switch (film.content_type) {
            case 'film':
              routePath = `films/${film.content_id}`;
              break;
            case 'serie':
              routePath = `series/${film.content_id}`;
              break;
            case 'anime':
              routePath = `anime/${film.content_id}`;
              break;
            case 'dorama':
              routePath = `dorama/${film.content_id}`;
              break;
          }

          console.log('Переходим на:', routePath, 'с данными:', fullFilmData);

          this.router.navigate([routePath], {
            state: { movie: fullFilmData }
          }).then(() => {
            window.scrollTo(0, 0);
          });

        } else {
          console.error('Ошибка от сервера:', response.message);
        }
      },
      error: (error) => {
        console.error('Ошибка при получении фильма:', error);
      }
    });
  }

  onClickDelete(content: any): void {
    const contentId = content.content_id;
    const contentType = content.content_type;

    this.profileService.removeFromFavorites(contentId, contentType).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(film =>
          (film.id || film.id) !== contentId
        );
        this.favorites_sync_service.markFavoritesChanged();

        localStorage.setItem(`fav_${contentId}`, 'false');

        this.getFavorites();
      },
      error: (error) => {
        console.error('Ошибка:', error);
      }
    });
  }
}

