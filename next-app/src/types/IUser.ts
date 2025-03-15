import { TSex } from './ISex';
export interface IUser {
    uId: number
    username: string
    password : string
    displayName: string
    profilePicUrl?: string
    age: number
    registeredDatetime: Date
    sex: TSex
    credit: number
    email: string
    rankId: number,
}
