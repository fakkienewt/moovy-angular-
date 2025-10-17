import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';
import { Service } from '../../services/service';

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

  similarGenres: string | undefined;
  type: string | undefined;

  loadingSimilar: boolean = false;

  constructor(
    public router: Router,
    private service: Service,
  ) { }

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.movie) {
      console.log()
      this.movie = navigation.movie;
    } else {
      this.error = true;
    }
    this.loadSimilarFilms();
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarFilms(): void {
    this.loadingSimilar = true;
    this.similarGenres = this.movie?.genres;
    this.type = this.movie?.type;

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
    this.router.navigate([`films/${item.id}`], {
      state: { movie: item }
    }).then(() => {
      window.location.reload();
    }).then(() => {
      window.scrollTo(0, 0); 
    });
  }
}
