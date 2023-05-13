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
  templateUrl: './muscles.page.html',
  styleUrls: ['./muscles.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Muscles {
  currentMuscles = undefined

  handleChange(ev:any) {
    this.currentMuscles = ev.target.value;
    console.log(this.currentMuscles)
    
  }

  save(){
    {/* api call here*/}
  }
}
