import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Service } from '../../services/service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dorama',
  standalone: false,
  templateUrl: './dorama.html',
  styleUrl: './dorama.scss'
})
export class Dorama implements OnInit {

  constructor(
    public router: Router,
    private service: Service,
  ) { }

  error: boolean = false;
  dorama: Film | null = null;

  similarGenres: string | undefined;
  similar_content: Film[] = [];
  type: string | undefined;

  loadingSimilar: boolean = false;

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.dorama) {
      this.dorama = navigation.dorama;
    } else {
      this.error = true;
    }
    this.loadSimilarDorama();
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarDorama(): void {
    this.loadingSimilar = true;
    this.similarGenres = this.dorama?.genres;
    this.type = this.dorama?.type;

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
    this.router.navigate([`dorama/${item.id}`], {
      state: { dorama: item }
    }).then(() => {
      window.location.reload();
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
