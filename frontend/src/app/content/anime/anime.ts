import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Film } from '../../models.ts/film.model';
import { Service } from '../../services/service';
import { ProfileService } from '../../services/profile.service';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-anime',
  standalone: false,
  templateUrl: './anime.html',
  styleUrl: './anime.scss'
})
export class Anime implements OnInit {

  anime: Film | null = null
  error = false;

  similar_content: Film[] = [];
  loadingSimilar: boolean = false;

  isFavorite: boolean = false;
  isLater: boolean = false;

  constructor(
    public router: Router,
    private service: Service,
    private profileService: ProfileService,
    private favoritesSync: FavoritesSyncService
  ) { }

  ngOnInit(): void {
    this.loadAnimeData();

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.loadAnimeData();
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  loadAnimeData(): void {
    const navigation = window.history.state;

    if (navigation?.movie) {
      this.anime = navigation.movie;
    } else if (navigation?.anime) {
      this.anime = navigation.anime;
    }

    if (this.anime) {
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


      this.loadSimilarAnime();
    } else {
      this.error = true;
    }
  }

  checkIfLaterForce(): void {
    if (!this.anime?.id) return;

    this.profileService.getLater().subscribe({
      next: (response: any) => {
        const later = response.data || [];
        this.isLater = later.some((item: any) =>
          (item.content_id === this.anime?.id || item.id === this.anime?.id)
        );
        localStorage.setItem(`later_${this.anime!.id}`, this.isLater.toString());
      },
      error: () => this.isLater = false
    });
  }

  checkIfLater(): void {
    if (!this.anime?.id) return;
    const savedLater = localStorage.getItem(`later_${this.anime.id}`);
    if (savedLater) {
      this.isLater = savedLater === 'true';
    } else {
      this.profileService.getLater().subscribe({
        next: (response: any) => {
          const later = response.data || [];
          this.isLater = later.some((item: any) =>
            (item.content_id === this.anime?.id || item.id === this.anime?.id)
          );
          localStorage.setItem(`later_${this.anime!.id}`, this.isLater.toString());
        },
        error: () => this.isLater = false
      });
    }
  }

  onClickLater(anime: Film | null): void {
    if (!anime?.id) return;

    if (this.isLater) {
      this.profileService.removeFromLater(anime.id, anime.type || 'anime').subscribe({
        next: () => {
          this.isLater = false;
          localStorage.setItem(`later_${anime.id}`, 'false');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          console.error('Ошибка при удалении из "Посмотреть позже"', error);
        }
      });
    } else {
      this.profileService.postLater(anime).subscribe({
        next: () => {
          this.isLater = true;
          localStorage.setItem(`later_${anime.id}`, 'true');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message?.includes('Уже в списке')) {
            this.isLater = true;
            localStorage.setItem(`later_${anime.id}`, 'true');
          } else {
            console.error('Ошибка при добавлении в "Посмотреть позже"', error);
          }
        }
      });
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.anime?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || response.favorites || [];
        this.isFavorite = favorites.some((fav: Film) => fav.id === this.anime?.id);
        localStorage.setItem(`fav_${this.anime!.id}`, this.isFavorite.toString());
      },
      error: () => this.isFavorite = false
    });
  }

  checkIfFavorite(): void {
    if (!this.anime?.id) return;

    const savedFav = localStorage.getItem(`fav_${this.anime.id}`);
    if (savedFav) {
      this.isFavorite = savedFav === 'true';
    } else {
      this.profileService.getFavorites().subscribe({
        next: (response: any) => {
          const favorites = response.data || response.favorites || [];
          this.isFavorite = favorites.some((fav: Film) => fav.id === this.anime?.id);
          localStorage.setItem(`fav_${this.anime!.id}`, this.isFavorite.toString());
        },
        error: () => this.isFavorite = false
      });
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarAnime(): void {
    this.loadingSimilar = true;
    const similarGenres = this.anime?.genres;
    const type = this.anime?.type;

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
    this.anime = null;
    this.similar_content = [];
    this.loadingSimilar = false;
    this.isFavorite = false;

    this.router.navigate([`anime/${item.id}`], {
      state: { anime: item }
    }).then(() => {
      window.scrollTo(0, 0);
      this.loadAnimeData();
    });
  }

  onClickFavorite(anime: Film | null): void {
    if (!anime?.id) return;

    if (this.isFavorite) {
      this.profileService.removeFromFavorites(anime.id, anime.type || 'anime').subscribe({
        next: () => {
          this.isFavorite = false;
          localStorage.setItem(`fav_${anime.id}`, 'false');
        },
        error: (error) => {
          console.error('Ошибка при удалении из избранного', error);
        }
      });
    } else {
      this.profileService.postFavorites(anime).subscribe({
        next: () => {
          this.isFavorite = true;
          localStorage.setItem(`fav_${anime.id}`, 'true');
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
}