import { collection, getDocs, query, where } from "firebase/firestore";
import { UserProps } from "../constants/types/interfaceProps";
import { FIRESTORE_DB } from "../firebaseConfig";

export const getUserTypeString = (userType: number) => {
  switch (userType) {
    case 1:
      return "Admin";
    case 2:
      return "Hopeliner";
    case 3:
      return "Client";
    default:
      return "Unknown";
  }
};

export const fetchUserData = async (
  email: string
): Promise<UserProps | undefined> => {
  try {
    const userQuery = query(
      collection(FIRESTORE_DB, "User"),
      where("email", "==", email)
    );
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      const user: UserProps = {
        dateCreated: userData.dateCreated,
        email: userData.email ?? "",
        fname: userData.fname ?? "",
        img: userData.img ?? "",
        is_verified: userData.is_verified ?? false,
        lname: userData.lname ?? "",
        name: userData.name ?? "",
        token: userData.token ?? "",
        user_id: userDoc.id,
        user_type: userData.user_type ?? 0,
      };

      return user;
    } else {
      console.log("No user found with this email");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return undefined;
  }
};

export const getHopeLinerAccess = (id: string): string => {
  const idMap: Record<string, string> = {
    IpdGlPdipuTNGjei9bkY4fUjvO62: "ULpbEtwiPJTvaar13v4fi8IFmFv1",
    EQ89TK89mjcaohNB23fmEcgCPcQ2: "EUDgGnnyhGPcs8MkvAMv9aqhHwq1",
    jeZdsNHxvcbbHERVXPnEsxFzqfk1: "kmmwZh7pe7Z40uDVQKFCN488kp22",
    iGH5PfAtiFWGYILtXWK1Ps1VL6N2: "u1zHLMIncMgr4s1er7kIhwzGto93",
  };

  return idMap[id] || id;
};
