import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Film } from '../../models.ts/film.model';

@Component({
  selector: 'app-series',
  standalone: false,
  templateUrl: './series.html',
  styleUrl: './series.scss'
})
export class Series implements OnInit {

  constructor(
    public router: Router
  ) { }

  series: Film | null = null
  error = false;

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.series) {
      this.series = navigation.series;
    } else {
      this.error = true;
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }
}
