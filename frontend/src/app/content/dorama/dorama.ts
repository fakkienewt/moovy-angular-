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
  
  getPosterUrl(poster: string | undefined): string {
    if (!poster) return '/assets/default-poster.jpg';
    let cleanPoster = poster.replace(/^['"]|['"]$/g, '').trim();
    const bgMatch = cleanPoster.match(/url\(['"]?(.*?)['"]?\)/);
    if (bgMatch && bgMatch[1]) {
      cleanPoster = bgMatch[1];
    }
    cleanPoster = cleanPoster.split(',')[0].trim();
    if (cleanPoster.startsWith('http')) {
      return cleanPoster;
    }
    return '/assets/default-poster.jpg';
  }
}
