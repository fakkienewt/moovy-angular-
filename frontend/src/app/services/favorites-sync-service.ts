import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesSyncService {

  private favoritesChanged = false;
  private laterChanged = false;

  markFavoritesChanged() {
    this.favoritesChanged = true;
  }

  getAndResetFavoritesChanged(): boolean {
    const changed = this.favoritesChanged;
    this.favoritesChanged = false;
    return changed;
  }

  markLaterChanged(): void {
    this.laterChanged = true;
  }

  getAndResetLaterChanged(): boolean {
    const changed = this.laterChanged;
    this.laterChanged = false;
    return changed;
  }
}
