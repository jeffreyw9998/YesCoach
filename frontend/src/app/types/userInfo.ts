
export interface UserInfoForm{
  email: string;
  name: string;
  id: string;
  weight: number;
  height: number;
  birthday: string;
  password: string;
}


export interface UserInfo extends UserInfoForm {
  goals: string[] | null;
  goals_quantity: number[] | null;
}
