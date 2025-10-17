import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Film } from '../../models.ts/film.model';
import { Service } from '../../services/service';

@Component({
  selector: 'app-series',
  standalone: false,
  templateUrl: './series.html',
  styleUrl: './series.scss'
})
export class Series implements OnInit {

  constructor(
    public router: Router,
    private service: Service,
  ) { }

  series: Film | null = null;
  similar_content: Film[] = [];

  similarGenres: string | undefined;
  type: string | undefined;

  loadingSimilar: boolean = false;
  error: boolean = false;


  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.series) {
      this.series = navigation.series;
    } else {
      console.log('ERRORR');
    }
    this.loadSimilarSeries();
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }

  loadSimilarSeries(): void {
    this.loadingSimilar = true;
    this.similarGenres = this.series?.genres;
    this.type = this.series?.type;

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
    this.router.navigate([`series/${item.id}`], {
      state: { series: item }
    }).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
