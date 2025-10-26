import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesSyncService {
  
  private favoritesChanged = false;

  markFavoritesChanged() {
    this.favoritesChanged = true;
  }

  getAndResetFavoritesChanged(): boolean {
    const changed = this.favoritesChanged;
    this.favoritesChanged = false;
    return changed;
  }
}
