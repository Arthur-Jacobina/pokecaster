import dotenv from 'dotenv';
dotenv.config();
import { Battle } from "../types/types.js"

export const getBattleIdByStatus = async (status: string) => {
    const response = await fetch(`${process.env.BACKEND_URL}/get/${status}`);
  
    const data = await response.json();
  
    return data as number[];
}

export const getBattleById = async (id: number) => {
    const response = await fetch(`${process.env.BACKEND_URL}/battle/${id}`);
  
    const data = await response.json();
  
    return data as Battle;
}