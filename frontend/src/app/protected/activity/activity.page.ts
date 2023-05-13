import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AlertController, IonicModule} from '@ionic/angular';
import {UserService} from "../../services/gService/user.service";
import {ApiService} from "../../services/apiservice/api.service";
import {UserInfo} from "../../types/userInfo";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import { FormGroup, FormControl} from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-goals',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Activity {
  currentActivities = undefined

  handleChange(ev:any) {
    this.currentActivities = ev.target.value;
    console.log(this.currentActivities)
    
  }

  save(){
    {/* api call here*/}
  }
}
