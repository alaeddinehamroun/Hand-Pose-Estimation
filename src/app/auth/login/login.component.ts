import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginForm } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  show: boolean = true;
  user: LoginForm = {
    email: '',
    password: ''
  }
  errorMessage!: string;
  loggedIn: boolean = false
  @Output() valueChange = new EventEmitter()
  constructor(
    private authService: AuthService,
    private router: Router) { }

  onSubmit() {
    this.router.navigate(['/home'])
    // this.authService.login(this.user.email, this.user.password).subscribe({
    //   next: (v) => {
    //     this.loggedIn = true
    //     this.valueChange.emit(this.user.email)

    //   },
    //   error: (e) => {
    //     if (e.status === 401) {
    //       this.errorMessage = "Invalid credentials"
    //     }

    //   },
    //   complete: () => {
    //     // this.router.navigate(['/home'])
    //   }
    // })
  }
}
