import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Film } from '../../models.ts/film.model';

@Component({
  selector: 'app-anime',
  standalone: false,
  templateUrl: './anime.html',
  styleUrl: './anime.scss'
})
export class Anime implements OnInit {

  constructor(
    public router: Router
  ) { }

  anime: Film | null = null;
  error = false;

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.anime) {
      this.anime = navigation.anime;
    } else {
      this.error = true;
    }
  }

  getPosterUrl(poster: string | null | undefined): string {
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
