import { createContext } from "react";
import { dummySettings, UserSettings } from "../models/user-settings"
import { ObscuredFBUser } from "../models/user"

export const UserContext = createContext<{ settings: UserSettings, user: ObscuredFBUser | null }>({ user: null, settings: dummySettings });
