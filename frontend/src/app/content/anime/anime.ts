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
      this.loadSimilarAnime();
    } else {
      this.error = true;
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