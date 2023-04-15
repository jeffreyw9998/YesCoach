import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {GoogleService} from "../../services/gService/google.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  constructor(private readonly gAuth: GoogleService,
              private readonly router: Router) { }

  ngOnInit() {
  }

  async logOut(){
    await this.gAuth.signOut();
    await this.router.navigate(['/login']);
  }
}
