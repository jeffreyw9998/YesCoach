import { Injectable } from '@angular/core';
import {Preferences} from "@capacitor/preferences";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }


  async set(key: string, value: string): Promise<void>{
    await Preferences.set({key, value});
  }

  async get(key: string): Promise<string | null>{
    const {value} = await Preferences.get({key});
    return value;
  }

  async remove(key: string): Promise<void>{
    await Preferences.remove({key});
  }


  async removeEverything(): Promise<void>{
      await Preferences.clear();
  }

}
