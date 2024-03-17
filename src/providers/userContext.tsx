import { createContext } from "react";
import { ObscuredFBUser } from "../models/user"

export const UserContext = createContext<{ user: ObscuredFBUser | null }>({ user: null });
