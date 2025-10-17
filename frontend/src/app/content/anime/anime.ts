import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Film } from '../../models.ts/film.model';
import { Service } from '../../services/service';

@Component({
  selector: 'app-anime',
  standalone: false,
  templateUrl: './anime.html',
  styleUrl: './anime.scss'
})
export class Anime implements OnInit {

  constructor(
    public router: Router,
    private service: Service,
  ) { }

  anime: Film | null = null;
  error = false;

  similarGenres: string | undefined;
  similar_content: Film[] = [];
  type: string | undefined;

  loadingSimilar: boolean = false;

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.anime) {
      this.anime = navigation.anime;
    } else {
      this.error = true;
    }
    this.loadSimilarAnime();
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarAnime(): void {
    this.loadingSimilar = true;
    this.similarGenres = this.anime?.genres;
    this.type = this.anime?.type;

    this.service.getSimilarFilms(this.similarGenres, this.type).subscribe({
      next: (data: Film[]) => {
        this.similar_content = data;
        this.loadingSimilar = false;
      },
      error: () => {
        this.loadingSimilar = false;
      }
    });
  }

  onTheNextPageS(item: Film): void {
    this.router.navigate([`anime/${item.id}`], {
      state: { anime: item }
    }).then(() => {
      window.location.reload();
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
