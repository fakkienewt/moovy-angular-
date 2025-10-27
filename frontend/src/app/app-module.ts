import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './basic/header/header';
import { Main } from './basic/main/main';
import { Footer } from './basic/footer/footer';
import { Dorama } from './content/dorama/dorama';
import { Films } from './content/films/films';
import { Series } from './content/series/series';
import { MainPagination } from './paginations/main-pagination/main-pagination';
import { Service } from './services/service';
import { NewFilms } from './basic/new-films/new-films';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Filters } from './content/filters/filters';
import { FormsModule } from '@angular/forms';
import { FilterPagination } from './paginations/filter-pagination/filter-pagination';
import { Anime } from './content/anime/anime';
import { Profile } from './profile/profile/profile';
import { SignUp } from './profile/sign.up/sign.up';
import { FooterService } from './services/footer.service';
import { HeaderService } from './services/header.service';
import { ProfileService } from './services/profile.service';
import { FavoritesSyncService } from './services/favorites-sync-service';
import { ProfilePagination } from './paginations/profile-pagination/profile-pagination';

@NgModule({
  declarations: [
    App,
    Header,
    Main,
    Footer,
    Dorama,
    Films,
    Series,
    Anime,
    MainPagination,
    NewFilms,
    Filters,
    FilterPagination,
    Profile,
    SignUp,
    ProfilePagination,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    Service,
    FooterService, 
    HeaderService, 
    ProfileService, 
    FavoritesSyncService
  ],
  bootstrap: [App]
})
export class AppModule { }
