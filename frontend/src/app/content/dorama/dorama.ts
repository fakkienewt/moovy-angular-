import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Service } from '../../services/service';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { FavoritesSyncService } from '../../services/favorites-sync-service';

@Component({
  selector: 'app-dorama',
  standalone: false,
  templateUrl: './dorama.html',
  styleUrl: './dorama.scss'
})
export class Dorama implements OnInit {

  error: boolean = false;
  dorama: Film | null = null;

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
    this.loadDoramaData();

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.loadDoramaData();
        window.scrollTo(0, 0);
      }, 100);
    });
  }

  loadDoramaData(): void {
    const navigation = window.history.state;
    if (navigation?.movie) {
      this.dorama = navigation.movie;
    } else if (navigation?.dorama) {
      this.dorama = navigation.dorama;
    }

    if (this.dorama) {
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

      this.loadSimilarDorama();
    } else {
      this.error = true;
    }
  }

  checkIfLaterForce(): void {
    if (!this.dorama?.id) return;

    this.profileService.getLater().subscribe({
      next: (response: any) => {
        const later = response.data || [];
        this.isLater = later.some((item: any) =>
          (item.content_id === this.dorama?.id || item.id === this.dorama?.id)
        );
        localStorage.setItem(`later_${this.dorama!.id}`, this.isLater.toString());
      },
      error: () => this.isLater = false
    });
  }

  checkIfLater(): void {
    if (!this.dorama?.id) return;
    const savedLater = localStorage.getItem(`later_${this.dorama.id}`);
    if (savedLater) {
      this.isLater = savedLater === 'true';
    } else {
      this.profileService.getLater().subscribe({
        next: (response: any) => {
          const later = response.data || [];
          this.isLater = later.some((item: any) =>
            (item.content_id === this.dorama?.id || item.id === this.dorama?.id)
          );
          localStorage.setItem(`later_${this.dorama!.id}`, this.isLater.toString());
        },
        error: () => this.isLater = false
      });
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.dorama?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || [];
        this.isFavorite = favorites.some((fav: any) =>
          (fav.content_id === this.dorama?.id || fav.id === this.dorama?.id)
        );
        localStorage.setItem(`fav_${this.dorama!.id}`, this.isFavorite.toString());
      },
      error: () => this.isFavorite = false
    });
  }


  onClickLater(dorama: Film | null): void {
    if (!dorama?.id) return;

    if (this.isLater) {
      this.profileService.removeFromLater(dorama.id, dorama.type || 'dorama').subscribe({
        next: () => {
          this.isLater = false;
          localStorage.setItem(`later_${dorama.id}`, 'false');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          console.error('Ошибка при удалении из "Посмотреть позже"', error);
        }
      });
    } else {
      this.profileService.postLater(dorama).subscribe({
        next: () => {
          this.isLater = true;
          localStorage.setItem(`later_${dorama.id}`, 'true');
          this.favoritesSync.markLaterChanged();
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message?.includes('Уже в списке')) {
            this.isLater = true;
            localStorage.setItem(`later_${dorama.id}`, 'true');
          } else {
            console.error('Ошибка при добавлении в "Посмотреть позже"', error);
          }
        }
      });
    }
  }

  checkIfFavorite(): void {
    if (!this.dorama?.id) return;

    const savedFav = localStorage.getItem(`fav_${this.dorama.id}`);
    if (savedFav) {
      this.isFavorite = savedFav === 'true';
    } else {
      this.profileService.getFavorites().subscribe({
        next: (response: any) => {
          const favorites = response.data || response.favorites || [];
          this.isFavorite = favorites.some((fav: Film) => fav.id === this.dorama?.id);
          localStorage.setItem(`fav_${this.dorama!.id}`, this.isFavorite.toString());
        },
        error: () => this.isFavorite = false
      });
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarDorama(): void {
    this.loadingSimilar = true;
    const similarGenres = this.dorama?.genres;
    const type = this.dorama?.type;

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
    this.dorama = null;
    this.similar_content = [];
    this.loadingSimilar = false;
    this.isFavorite = false;

    this.router.navigate([`dorama/${item.id}`], {
      state: { dorama: item }
    }).then(() => {
      window.scrollTo(0, 0);
      this.loadDoramaData();
    });
  }

  onClickFavorite(dorama: Film | null): void {
    if (!dorama?.id) return;

    if (this.isFavorite) {
      this.profileService.removeFromFavorites(dorama.id, dorama.type || 'dorama').subscribe({
        next: () => {
          this.isFavorite = false;
          localStorage.setItem(`fav_${dorama.id}`, 'false');
        },
        error: (error) => {
          console.error('Ошибка при удалении из избранного', error);
        }
      });
    } else {
      this.profileService.postFavorites(dorama).subscribe({
        next: () => {
          this.isFavorite = true;
          localStorage.setItem(`fav_${dorama.id}`, 'true');
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