import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { Service } from '../../services/service';
import { ProfileService } from '../../services/profile.service';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-series',
  standalone: false,
  templateUrl: './series.html',
  styleUrl: './series.scss'
})
export class Series implements OnInit {

  series: Film | null = null;
  error: boolean = false;

  similar_content: Film[] = [];
  loadingSimilar: boolean = false;

  isLater: boolean = false;
  isFavorite: boolean = false;

  constructor(
    public router: Router,
    private service: Service,
    private profileService: ProfileService,
    public favoritesSync: FavoritesSyncService
  ) { }

  ngOnInit(): void {
    this.loadSeriesData();

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.loadSeriesData();
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  loadSeriesData(): void {
    const navigation = window.history.state;
    if (navigation?.movie) {
      this.series = navigation.movie;
    } else if (navigation?.series) {
      this.series = navigation.series;
    }

    if (this.series) {
      if (this.favoritesSync.getAndResetFavoritesChanged()) {
        this.checkIfFavoriteForce();
      } else {
        this.checkIfFavorite();
      }

      if (this.favoritesSync.getAndResetLaterChanged()) {
        this.checkIfLaterForce();
      } else {
        this.checkIfLater();
      }

      this.loadSimilarSeries();
    } else {
      this.error = true;
    }
  }

  checkIfLaterForce(): void {
    if (!this.series?.id) return;

    this.profileService.getLater().subscribe({
      next: (response: any) => {
        const later = response.data || [];
        this.isLater = later.some((item: any) =>
          (item.content_id === this.series?.id || item.id === this.series?.id)
        );
        localStorage.setItem(`later_${this.series!.id}`, this.isLater.toString());
      },
      error: () => this.isLater = false
    });
  }

  checkIfLater(): void {
    if (!this.series?.id) return;
    const savedLater = localStorage.getItem(`later_${this.series.id}`);
    if (savedLater) {
      this.isLater = savedLater === 'true';
    } else {
      this.profileService.getLater().subscribe({
        next: (response: any) => {
          const later = response.data || [];
          this.isLater = later.some((item: any) =>
            (item.content_id === this.series?.id || item.id === this.series?.id)
          );
          localStorage.setItem(`later_${this.series!.id}`, this.isLater.toString());
        },
        error: () => this.isLater = false
      });
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.series?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || [];
        this.isFavorite = favorites.some((fav: any) =>
          (fav.content_id === this.series?.id || fav.id === this.series?.id)
        );
        localStorage.setItem(`fav_${this.series!.id}`, this.isFavorite.toString());
      },
      error: () => this.isFavorite = false
    });
  }

  checkIfFavorite(): void {
    if (!this.series?.id) return;

    const savedFav = localStorage.getItem(`fav_${this.series.id}`);
    if (savedFav) {
      this.isFavorite = savedFav === 'true';
    } else {
      this.profileService.getFavorites().subscribe({
        next: (response: any) => {
          const favorites = response.data || response.favorites || [];
          this.isFavorite = favorites.some((fav: Film) => fav.id === this.series?.id);
          localStorage.setItem(`fav_${this.series!.id}`, this.isFavorite.toString());
        },
        error: () => this.isFavorite = false
      });
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarSeries(): void {
    this.loadingSimilar = true;
    const similarGenres = this.series?.genres;
    const type = this.series?.type;

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
    this.series = null;
    this.similar_content = [];
    this.loadingSimilar = false;
    this.isFavorite = false;

    this.router.navigate([`series/${item.id}`], {
      state: { series: item }
    }).then(() => {
      window.scrollTo(0, 0);
      this.loadSeriesData();
    });
  }

  onClickFavorite(series: Film | null): void {
    if (!series?.id) return;

    if (this.isFavorite) {
      this.profileService.removeFromFavorites(series.id, series.type || 'serie').subscribe({
        next: () => {
          this.isFavorite = false;
          localStorage.setItem(`fav_${series.id}`, 'false');
        },
        error: (error) => {
          console.error('Ошибка при удалении из избранного', error);
        }
      });
    } else {
      this.profileService.postFavorites(series).subscribe({
        next: () => {
          this.isFavorite = true;
          localStorage.setItem(`fav_${series.id}`, 'true');
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

  onClickLater(serie: Film | null): void {
    if (!serie?.id) return;

    if (this.isLater) {
      this.profileService.removeFromLater(serie.id, serie.type || 'serie').subscribe({
        next: () => {
          this.isLater = false;
          localStorage.setItem(`later_${serie.id}`, 'false');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          console.error('Ошибка при удалении из "Посмотреть позже"', error);
        }
      });
    } else {
      this.profileService.postLater(serie).subscribe({
        next: () => {
          this.isLater = true;
          localStorage.setItem(`later_${serie.id}`, 'true');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message?.includes('Уже в списке')) {
            this.isLater = true;
            localStorage.setItem(`later_${serie.id}`, 'true');
          } else {
            console.error('Ошибка при добавлении в "Посмотреть позже"', error);
          }
        }
      });
    }
  }
}