import { Battle } from "../types/types.js"

export const getBattleIdByStatus = async (status: string) => {
    const response = await fetch(`http://ethonline24-production.up.railway.app/get/${status}`);
  
    const data = await response.json();
  
    return data as number[];
}

export const getBattleById = async (id: number) => {
    const response = await fetch(`http://ethonline24-production.up.railway.app/battle/${id}`);
  
    const data = await response.json();
  
    return data as Battle;
}

export const registerUser = async (fid: number, wallet: string) => {
    const response = await fetch(`http://ethonline24-production.up.railway.app/register-converse-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fid,
            wallet
        })
    });
  
    const data = await response.json();
  
    return data as string;
}