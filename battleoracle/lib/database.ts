import { Battle } from "../types/types.js"

const BACKEND_URL = 'http://ethonline24-production.up.railway.app/api';

export const getBattleIdByStatus = async (status: string) => {
    console.log(`${BACKEND_URL}/get/${status}`)

    const response = await fetch(`${BACKEND_URL}/get/${status}`);
  
    const data = await response.json();

    return data.battles as number[];
}

export const getBattleById = async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/battle/${id}`);
  
    const data = await response.json();
  
    return data as Battle;
}

export const registerUser = async (fid: number, wallet: string) => {
    const response = await fetch(`${BACKEND_URL}/register-converse-user`, {
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