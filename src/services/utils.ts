import { DataSnapshot } from "firebase/database"

export const checkSnapshotExist = <T>(snapshot: DataSnapshot): T => {
	if (snapshot.exists()) {
		return snapshot.val()
	} else {
		//todo show error dialog
		console.log("%c check snapshot exist fails", "color: red;")
		throw Error("check snapshot exist fails")
	}
}
