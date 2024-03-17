import React, { PropsWithChildren, useEffect, useState } from "react"
import { UserContext } from "./userContext"
import { getAuth, Unsubscribe } from "firebase/auth"
import { ObscuredFBUser } from "../models/user"
let unsubscribe: Unsubscribe = () => { }
export const UserProvider: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<ObscuredFBUser | null>(null);

	useEffect(() => {
		unsubscribe = getAuth().onAuthStateChanged((firebaseUser) => {
			if (firebaseUser) {
				const { displayName, uid, email, emailVerified, phoneNumber, photoURL } = firebaseUser
				setUser({
					displayName,
					uid,
					emailVerified,
					email,
					phoneNumber,
					photoURL
				});
			} else {
				setUser(firebaseUser)
			}
		})

		return unsubscribe;
	}, []);

	return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
