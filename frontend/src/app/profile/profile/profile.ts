import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {

  favorites: any[] = [];
  watchLater: any[] = [];

  userImage: string | null = null;
  userNickname: string = '';
  isLoading: boolean = false;

  activeTab: string = 'favorites';

  currentPage: number = 1;
  total_items: number = 12;

  constructor(
    private profileService: ProfileService,
    public router: Router,
    public favorites_sync_service: FavoritesSyncService
  ) { }

  getPaginatedFavorites(): any[] {
    const start = (this.currentPage - 1) * this.total_items;
    const end = start + this.total_items;
    return this.favorites.slice(start, end);
  }

  getPaginatedWatchLater(): any[] {
    const start = (this.currentPage - 1) * this.total_items;
    const end = start + this.total_items;
    return this.watchLater.slice(start, end);
  }

  getTotalPages(): number {
    if (this.activeTab === 'favorites') {
      return this.favorites.length / this.total_items;
    } else if (this.activeTab === 'watchLater') {
      return this.watchLater.length / this.total_items;
    }
    return 1;
  }

  loadCategoryData(category: string): void {
    this.activeTab = category;

    switch (category) {
      case 'favorites':
        this.currentPage = 1;
        this.getFavorites();
        break;
      case 'watched':
        console.log('watched');
        break;
      case 'watchLater':
        this.currentPage = 1;
        this.getWatchLater();
        break;
      case 'comments':
        console.log('comments');
        break;
    }
  }

  onChangedPage(page: number): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.getFavorites();
  }

  getFavorites(): void {
    this.isLoading = true;
    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.favorites = response.data;
        } else if (response && response.favorites) {
          this.favorites = response.favorites;
        } else {
          this.favorites = [];
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

  getWatchLater(): void {
    this.isLoading = true;
    this.profileService.getLater().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.watchLater = response.data;
        } else if (response && response.watchlater) {
          this.watchLater = response.watchlater;
        } else {
          this.watchLater = [];
        }
        this.isLoading = false;
        console.log('Смотреть позже:', this.watchLater);
      },
      error: (error) => {
        console.error('Ошибка при получении "Смотреть позже":', error);
        this.watchLater = [];
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

    const contentId = film.content_id || film.id;
    const contentType = film.content_type || film.type;

    this.profileService.getFilmById(contentId, contentType).subscribe({
      next: (response: any) => {
        if (response.success) {
          const fullFilmData = response.data;

          let routePath = '';

          switch (contentType) {
            case 'film':
              routePath = `films/${contentId}`;
              break;
            case 'serie':
              routePath = `series/${contentId}`;
              break;
            case 'anime':
              routePath = `anime/${contentId}`;
              break;
            case 'dorama':
              routePath = `dorama/${contentId}`;
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
    const contentId = content.content_id || content.id;
    const contentType = content.content_type || content.type;

    this.profileService.removeFromFavorites(contentId, contentType).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(film =>
          film.content_id !== contentId && film.id !== contentId
        );
        this.favorites_sync_service.markFavoritesChanged();
        localStorage.setItem(`fav_${contentId}`, 'false');
      },
      error: (error) => {
        console.error('Ошибка:', error);
      }
    });
  }

  onClickDeleteFromLater(content: any): void {
    const contentId = content.content_id || content.id;
    const contentType = content.content_type || content.type;

    this.profileService.removeFromLater(contentId, contentType).subscribe({
      next: () => {
        this.watchLater = this.watchLater.filter(film =>
          film.content_id !== contentId && film.id !== contentId
        );
        this.favorites_sync_service.markLaterChanged();
        localStorage.setItem(`later_${contentId}`, 'false');
      },
      error: (error) => {
        console.error('Ошибка при удалении из "Смотреть позже":', error);
      }
    });
  }
}