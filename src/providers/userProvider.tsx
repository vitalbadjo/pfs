import React, { PropsWithChildren, useEffect, useState } from "react"
import { getDatabase, ref, onValue } from "firebase/database";
import { UserContext } from "./userContext"
import { realtimeDatabasePaths } from "../models/realtime-database-paths"
import { getAuth, Unsubscribe } from "firebase/auth"
import { ObscuredFBUser } from "../models/user"

export const UserProvider: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<ObscuredFBUser | null>(null);

	useEffect(() => {
		const unsubscribe = getAuth().onAuthStateChanged((firebaseUser) => {
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

	useEffect(() => {
		let unsubscribe: Unsubscribe = () => { }
		if (user?.uid) {
			const db = getDatabase();
			const settingsRef = ref(db, realtimeDatabasePaths.user.settingsPath(user?.uid!));
			unsubscribe = onValue(settingsRef, (snapshot) => {
				const data = snapshot.val();
			});
		}
		return unsubscribe;
	}, [user]);

	return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
