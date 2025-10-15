import { Component, OnInit } from '@angular/core';
import { Film } from '../../models.ts/film.model';

@Component({
  selector: 'app-dorama',
  standalone: false,
  templateUrl: './dorama.html',
  styleUrl: './dorama.scss'
})
export class Dorama implements OnInit {

  error: boolean = false;
  dorama: Film | null = null;

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.dorama) {
      this.dorama = navigation.dorama;
    } else {
      this.error = true;
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    return poster.startsWith('http') ? poster : '/assets/default-poster.jpg';
  }
}
