import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Main } from './basic/main/main';
import { Films } from './content/films/films';
import { Series } from './content/series/series';
import { Anime } from './content/anime/anime';
import { Dorama } from './content/dorama/dorama';
import { SignUp } from './profile/sign.up/sign.up';
import { Profile } from './profile/profile/profile';

const routes: Routes = [
  { path: '', component: Main },

  { path: 'movie/:id', component: Films },

  { path: 'films/:id', component: Films },

  { path: 'series/:id', component: Series },

  { path: 'anime/:id', component: Anime },

  { path: 'dorama/:id', component: Dorama }, 

  { path: 'sign.up', component: SignUp }, 

  { path: 'profile', component: Profile }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
