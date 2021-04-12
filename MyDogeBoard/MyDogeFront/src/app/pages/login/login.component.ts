import { Component, ElementRef, OnInit } from "@angular/core";
import { ApiService } from './../../services/api.service';

@Component({
  selector: "app-login",
  templateUrl: "login.component.html"
})

export class LoginComponent implements OnInit {
  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    const form = document.getElementById('login')
        form.addEventListener('submit', login)

        async function login(event) {
            event.preventDefault()
            const username = document.getElementById('username').value
            const password = document.getElementById('password').value

            const result = await fetch('http://localhost:3080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }).then((res) => res.json())

            if (result.status === 'ok') {
                // everythign went fine
                console.log('Got the token: ', result.data)
                localStorage.setItem('token', result.data)
                alert('Success')
            } else {
                alert(result.error)
            }
      }
  }
}
