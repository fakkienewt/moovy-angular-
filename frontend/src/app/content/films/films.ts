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
      this.loadSimilarFilms();
    } else {
      this.error = true;
    }
  }

  checkIfFavoriteForce(): void {
    if (!this.movie?.id) return;

    this.profileService.getFavorites().subscribe({
      next: (response: any) => {
        const favorites = response.data || response.favorites || [];
        this.isFavorite = favorites.some((fav: Film) => fav.id === this.movie?.id);
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
          const favorites = response.data || response.favorites || [];
          this.isFavorite = favorites.some((fav: Film) => fav.id === this.movie?.id);
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