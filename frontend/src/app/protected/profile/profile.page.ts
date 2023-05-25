import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ProfilePage implements OnInit {


  constructor(public readonly uService: UserService,
              private readonly router: Router) {
  }

  ngOnInit() {
  }

  async logOut() {
    await this.uService.signOut();
    await this.router.navigate(['/login']);
  }
}
