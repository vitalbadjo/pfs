import { UserSettings } from "./user-settings"
import { User } from "firebase/auth"

export type UserModel = {
	id: string
	uid: string
	email: string
	name: string
	displayName: string
	phone: string
	avatar: string // base64 or uploaded
	settings: UserSettings
}

export type ObscuredFBUser = Pick<User, "photoURL" | "phoneNumber" | "email" | "emailVerified" | "displayName" | "uid">
