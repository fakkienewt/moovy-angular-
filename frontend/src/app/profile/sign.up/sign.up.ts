import { Component, OnInit } from '@angular/core';
import { FooterService } from '../../services/footer.service';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign.up',
  standalone: false,
  templateUrl: './sign.up.html',
  styleUrl: './sign.up.scss'
})
export class SignUp implements OnInit {

  email: string;
  password: string;

  alreadyRegistered: boolean = false;
  registrationSuccess: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private footerService: FooterService,
    private profileService: ProfileService,
    public router: Router
  ) { }

  onClickSignUp(email: string, password: string): void {
    this.alreadyRegistered = false;
    this.registrationSuccess = false;

    if (!email || !password) {
      console.log('Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      console.log('Некорректная почта');
      return;
    }

    this.email = email;
    this.password = password;

    console.log('Данные из формы:', email, password);

    this.profileService.register(email, password).subscribe({
      next: (response) => {
        console.log('Регистрация успешна:', response);

        if (response.data && response.data.token) {
          this.profileService.setToken(response.data.token);
          console.log('JWT токен сохранен в localStorage');

          this.loadUserProfile();
        }

        this.registrationSuccess = true;
        this.alreadyRegistered = false;
      },
      error: (error) => {
        console.log('Ошибка регистрации:', error);
        this.alreadyRegistered = true;
        this.registrationSuccess = false;
      }
    });
  }

  onClickLogin(email: string, password: string): void {
    this.alreadyRegistered = false;
    this.registrationSuccess = false;

    if (!email || !password) {
      console.log('Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      console.log('Некорректная почта');
      return;
    }

    console.log('Попытка входа:', email);

    this.profileService.login(email, password).subscribe({
      next: (response) => {
        console.log('Вход успешен:', response);

        if (response.data && response.data.token) {
          this.profileService.setToken(response.data.token);
          console.log('JWT токен сохранен');

          this.loadUserProfile();
        }
      },
      error: (error) => {
        console.log('Ошибка входа:', error);
        if (error.status === 401) {
          console.log('Неверный email или пароль');
        }
      }
    });
  }

  loadUserProfile(): void {
    if (!this.profileService.isAuthenticated()) {
      console.log('Пользователь не авторизован');
      this.isAuthenticated = false;
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        console.log('Данные профиля:', profile);
        this.isAuthenticated = true;
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.log('Ошибка получения профиля:', error);
      }
    });
  }

  checkAuthStatus(): void {
    if (this.profileService.isAuthenticated()) {
      console.log('Пользователь уже авторизован');
      this.isAuthenticated = true;
      this.loadUserProfile();
    } else {
      console.log('Пользователь не авторизован');
      this.isAuthenticated = false;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.footerService.hide();
    });
    this.checkAuthStatus();
  }

  ngOnDestroy() {
    setTimeout(() => {
      this.footerService.show();
    });
  }
}