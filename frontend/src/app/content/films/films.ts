import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { Service } from '../../services/service';
import { ProfileService } from '../../services/profile.service';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-films',
  standalone: false,
  templateUrl: './films.html',
  styleUrl: './films.scss'
})
export class Films implements OnInit {

  movie: Film | null = null;
  error: boolean = false;

  similar_content: Film[] = [];
  loadingSimilar: boolean = false;

  isFavorite: boolean = false;
  isLater: boolean = false;

  constructor(
    public router: Router,
    private service: Service,
    private profileService: ProfileService,
    public favorites_sync_service: FavoritesSyncService
  ) { }

  ngOnInit(): void {
    this.loadMovieData();

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.loadMovieData();
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  loadMovieData(): void {
    const navigation = window.history.state;
    if (navigation && navigation.movie) {
      this.movie = navigation.movie;

      if (this.favorites_sync_service.getAndResetFavoritesChanged()) {
        this.checkIfFavoriteForce();
      } else {
        this.checkIfFavorite();
      }

      if (this.favorites_sync_service.getAndResetLaterChanged()) {
        this.checkIfLaterForce();
      } else {
        this.checkIfLater();
      }

      this.loadSimilarFilms();
    } else {
      this.error = true;
    }
  }

  checkIfLaterForce(): void {
    if (!this.movie?.id) return;

    this.profileService.getLater().subscribe({
      next: (response: any) => {
        const later = response.data || [];
        this.isLater = later.some((item: any) =>
          (item.content_id === this.movie?.id || item.id === this.movie?.id)
        );
        localStorage.setItem(`later_${this.movie!.id}`, this.isLater.toString());
      },
      error: () => this.isLater = false
    });
  }

  checkIfLater(): void {
    if (!this.movie?.id) return;
    const savedLater = localStorage.getItem(`later_${this.movie.id}`);
    if (savedLater) {
      this.isLater = savedLater === 'true';
    } else {
      this.profileService.getLater().subscribe({
        next: (response: any) => {
          const later = response.data || [];
          this.isLater = later.some((item: any) =>
            (item.content_id === this.movie?.id || item.id === this.movie?.id)
          );
          localStorage.setItem(`later_${this.movie!.id}`, this.isLater.toString());
        },
        error: () => this.isLater = false
      });
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.movie?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || [];
        this.isFavorite = favorites.some((fav: any) =>
          (fav.content_id === this.movie?.id || fav.id === this.movie?.id)
        );
        localStorage.setItem(`fav_${this.movie!.id}`, this.isFavorite.toString());
      },
      error: () => this.isFavorite = false
    });
  }

  checkIfFavorite(): void {
    if (!this.movie?.id) return;

    const savedFav = localStorage.getItem(`fav_${this.movie.id}`);

    if (savedFav) {
      this.isFavorite = savedFav === 'true';
    } else {
      this.profileService.getFavorites().subscribe({
        next: (response: any) => {
          const favorites = response.data || [];
          this.isFavorite = favorites.some((fav: any) =>
            (fav.content_id === this.movie?.id || fav.id === this.movie?.id)
          );
          localStorage.setItem(`fav_${this.movie!.id}`, this.isFavorite.toString());
        },
        error: () => this.isFavorite = false
      });
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarFilms(): void {
    this.loadingSimilar = true;
    const similarGenres = this.movie?.genres;
    const type = this.movie?.type;

    this.service.getSimilarFilms(similarGenres, type).subscribe({
      next: (data: Film[]) => {
        this.similar_content = data.slice(0, 4);
        this.loadingSimilar = false;
      },
      error: () => {
        this.loadingSimilar = false;
      }
    });
  }

  onTheNextPageS(item: Film): void {
    this.movie = null;
    this.similar_content = [];
    this.loadingSimilar = false;
    this.isFavorite = false;

    this.router.navigate([`films/${item.id}`], {
      state: { movie: item }
    }).then(() => {
      window.scrollTo(0, 0);
      this.loadMovieData();
    });
  }

  onClickFavorite(movie: Film | null): void {
    if (!movie?.id) return;

    if (this.isFavorite) {
      this.profileService.removeFromFavorites(movie.id, movie.type || 'film').subscribe({
        next: () => {
          this.isFavorite = false;
          localStorage.setItem(`fav_${movie.id}`, 'false');
          this.favorites_sync_service.markFavoritesChanged();
        },
        error: (error) => {
          console.error('Ошибка при удалении из избранного', error);
        }
      });
    } else {
      this.profileService.postFavorites(movie).subscribe({
        next: () => {
          this.isFavorite = true;
          localStorage.setItem(`fav_${movie.id}`, 'true');
          this.favorites_sync_service.markFavoritesChanged();
        },
        error: (error) => {
          console.error('Ошибка при добавлении в избранное', error);
        }
      });
    }
  }

  getRemainingSkeletons(): number[] {
    const remaining = 4 - this.similar_content.length;
    return remaining > 0 ? Array(remaining).fill(0).map((x, i) => i) : [];
  }

  onClickLater(movie: Film | null): void {
    if (!movie?.id) return;

    if (this.isLater) {
      this.profileService.removeFromLater(movie.id, movie.type || 'film').subscribe({
        next: () => {
          this.isLater = false;
          localStorage.setItem(`later_${movie.id}`, 'false');
          this.favorites_sync_service.markLaterChanged();
        },
        error: (error) => {
          console.error('Ошибка при удалении из "Посмотреть позже"', error);
        }
      });
    } else {
      this.profileService.postLater(movie).subscribe({
        next: () => {
          this.isLater = true;
          localStorage.setItem(`later_${movie.id}`, 'true');
          this.favorites_sync_service.markLaterChanged();
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message?.includes('Уже в списке')) {
            this.isLater = true;
            localStorage.setItem(`later_${movie.id}`, 'true');
          } else {
            console.error('Ошибка при добавлении в "Посмотреть позже"', error);
          }
        }
      });
    }
  }
}