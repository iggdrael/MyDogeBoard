import { Component, ElementRef, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-login",
  templateUrl: "login.component.html"
})

export class LoginComponent implements OnInit {
  //Acces to Backend API
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    const form = document.getElementById('loginForm')
    const registerButton = document.getElementById('registerButton')
    //Adding listener on form submit input
    form.addEventListener('submit', login)
    //Adding listener on login/register change mode input 
    registerButton.addEventListener('click', changeRegisterButton)


    /**
     * Redirect to /login or /register backed API endpoint
     * 
     * @param {*} event
     */
    async function login(event) {
        event.preventDefault()
        //Casting inputs to access inputs values
        const username = (<HTMLInputElement>document.getElementById('username')).value;
        const password = (<HTMLInputElement>document.getElementById('password')).value;
        const link = (<HTMLInputElement>document.getElementById('submit')).value

        //Fetching API response
        const result = await fetch('http://localhost:3080/api/' + link.toLowerCase(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            //Post body : {username, password}
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then((res) => res.json())

        if (result.status === 'ok') {
            // everything went fine
            console.log('Got the token: ', result.data)
            //Storing token in localStorage
            localStorage.setItem('token', result.data)
            //Storing default chart config in localStorage
            localStorage.setItem('symbol', "BTC")
            localStorage.setItem('interval', "1d")

            //If logged in, redirect to dashboard
            if (link.localeCompare("Login") == 0)
              window.location.href="http://localhost:4200/login#/dashboard";
            else{
              //If register, reload page
              alert("Le compte a été créé, veuillez vous connecter")
              window.location.reload();
            }
        } else {
            alert(result.error)
      }
    }

    
    /**
     * Changing login/register input value
     *
     * @param {*} event
     */
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
