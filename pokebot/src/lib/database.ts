import { BACKEND_URL } from "../constant/config"
import { Battle } from "../types/types"

export const getBattleById = async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/battle/${id}`);
  
    const data = await response.json();
  
    return data as Battle;
  }