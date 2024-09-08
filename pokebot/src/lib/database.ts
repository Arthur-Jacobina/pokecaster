import { BACKEND_URL } from "../constant/config.js";

export const getFid = async (address: string) => {
  // try to get fid from database
  // if fid is not found, need to redirect user to the /register frame

  const response = await fetch(`${BACKEND_URL}/converse-user/${address}`);

  if(response.status == 500) {
    throw new Error("Internal Server Error");
  }
  
  if(response.status == 404) {
    return null;
  }

  const data : any = await response.json();

  return data.fid;
}

export const getUserBattleFrames = async (address: string) => {
  const response = await fetch(`${BACKEND_URL}/converse-user/${address}/battles`);

  const data : any = await response.json();

  const battles = data.battles;

  const canPlayerMove : any = [];

  const fid = await getFid(address);

  // for each battle, check if player is maker or taker
  // if player is maker, check if maker_move is null
  // if player is taker, check if taker_move is null

  battles.forEach((battle: any) => {
    if(battle.maker === null || battle.taker === null) {
      canPlayerMove.push({id: battle.id, canPlayerMove: false});
    } else if(battle.maker === fid && battle.maker_move === null) {
      canPlayerMove.push({id: battle.id, canPlayerMove: true});
    } else if(battle.taker === fid && battle.taker_move === null) {
      canPlayerMove.push({id: battle.id, canPlayerMove: true});
    } else {
      canPlayerMove.push({id: battle.id, canPlayerMove: false});
    }
  });

  return canPlayerMove;
} 