import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-films',
  standalone: false,
  templateUrl: './films.html',
  styleUrl: './films.scss'
})
export class Films implements OnInit {

  movie: Film | null = null;
  error: boolean = false;

  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.movie) {
      this.movie = navigation.movie;
    } else {
      this.error = true;
    }
  }
  
  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }
}
