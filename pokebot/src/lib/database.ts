import { BACKEND_URL } from "../constant/config";

export const getFid = async (username: string) => {
  // try to get fid from database
  // if fid is not found, need to redirect user to the /register frame

  const response = await fetch(`${BACKEND_URL}/converse-user/${username}`);

  if(response.status == 500) {
    throw new Error("Internal Server Error");
  }
  
  if(response.status == 404) {
    return null;
  }

  const data : any = await response.json();

  return data.fid;
}