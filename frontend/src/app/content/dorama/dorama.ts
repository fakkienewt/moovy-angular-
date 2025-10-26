import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class Dorama implements OnInit, OnDestroy {

  error: boolean = false;
  dorama: Film | null = null;

  similar_content: Film[] = [];
  loadingSimilar: boolean = false;

  isFavorite: boolean = false;

  private popStateListener: () => void;

  constructor(
    public router: Router,
    private service: Service,
    private profileService: ProfileService,
    private favoritesSync: FavoritesSyncService 
  ) {
    this.popStateListener = () => {
      setTimeout(() => {
        this.loadDoramaData();
        window.scrollTo(0, 0);
      }, 100);
    };
  }

  ngOnInit(): void {
    this.loadDoramaData();
    window.addEventListener('popstate', this.popStateListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.popStateListener);
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
      this.loadSimilarDorama();
    } else {
      this.error = true;
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.dorama?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || response.favorites || [];
        this.isFavorite = favorites.some((fav: Film) => fav.id === this.dorama?.id);
        localStorage.setItem(`fav_${this.dorama!.id}`, this.isFavorite.toString());
      },
      error: () => this.isFavorite = false
    });
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
    if (!this.dorama) return;

    this.loadingSimilar = true;
    const similarGenres = this.dorama.genres;
    const type = this.dorama.type;

    this.service.getSimilarFilms(similarGenres, type).subscribe({
      next: (data: Film[]) => {
        this.similar_content = data.slice(0, 4);
        this.loadingSimilar = false;
      },
      error: () => {
        this.loadingSimilar = false;
        this.similar_content = [];
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