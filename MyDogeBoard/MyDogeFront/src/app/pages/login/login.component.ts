import { Component, ElementRef, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-login",
  templateUrl: "login.component.html"
})

export class LoginComponent implements OnInit {
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    const form = document.getElementById('loginForm')
    const registerButton = document.getElementById('registerButton')
    form.addEventListener('submit', login)
    registerButton.addEventListener('click', changeRegisterButton)

    async function login(event) {
        event.preventDefault()
        const username = (<HTMLInputElement>document.getElementById('username')).value;
        const password = (<HTMLInputElement>document.getElementById('password')).value;
        const link = (<HTMLInputElement>document.getElementById('submit')).value

        const result = await fetch('http://localhost:3080/api/' + link.toLowerCase(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then((res) => res.json())

        if (result.status === 'ok') {
            // everything went fine
            console.log('Got the token: ', result.data)
            localStorage.setItem('token', result.data)
            localStorage.setItem('symbol', "BTC")
            localStorage.setItem('interval', "1d")

            if (link.localeCompare("Login") == 0)
              window.location.href="http://localhost:4200/login#/dashboard";
            else{
              alert("Le compte a été créé, veuillez vous connecter")
              window.location.reload();
            }
        } else {
            alert(result.error)
      }
    }

    async function changeRegisterButton(event) {
      event.preventDefault()
      const registerButton = document.getElementById('registerButton')
      const registerInput = (<HTMLInputElement>document.getElementById('submit'))

      if (registerButton.innerText == "Register"){
        registerButton.innerText = "Login"
        registerInput.value = "Register"
      }
      else{
        registerButton.innerText = "Register"
        registerInput.value = "Login"
      }
    }

  }
}
