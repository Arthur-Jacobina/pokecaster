import { run, HandlerContext } from "@xmtp/message-kit";
import { getFid, getUserBattleFrames } from "./lib/database.js";

run(async (context: HandlerContext) => {
  const { message: { typeId } } = context;
  console.log(typeId);
  if (typeId === "text" || typeId === "reply") {
    const { message: { content: { content: text }, sender: { address } } } = context;

    const fid = await getFid(address);

    if(fid !== null) {
      // list of battles with status = "waiting"
      if (text === "/battle") {
        await context.send(`https://pokecasterv1.vercel.app/api`);
      } 
  
      // get a battle by its id
      else if (text.startsWith("/battle get")) {
        const id = text.split(" ")[2];
        await context.send(`https://pokecasterv1.vercel.app/api/battle-by-id/${id}`);
      } 

      // list of battles the user is participating in
      else if (text === "/my battles") {
        const battles = await getUserBattleFrames(address);

        if(battles.length === 0) {
          await context.send(`You are not participating in any battles`);
        } else {
          await context.send(`You are participating in the following battles:`);
          battles.forEach(async (battle: any) => {
            if(battle.canPlayerMove) {
              await context.send(`IT'S YOUR TURN! https://pokeframes-three.vercel.app/api/battle/${battle.id}`);
            } else {
              await context.send(`Awaiting opponent... https://pokeframes-three.vercel.app/api/battle/${battle.id}`);
            }
          });
        }
      }
  
      // list of commands available + short descriptions
      else if (text === "/help") {
        await context.send(`🔎 Commands below are currently available`);
        await context.send(`/battle -> sends a list of joinable battles`);
        await context.send(`/battle get <id> -> get a battle by its id and play it on the chat`);
        await context.send(`/my battles -> get frames of battles you are participating in`);
      } 
      
      // fallback in caso of unexpected text (text !== "/battle" || text !== "/help" || text !== "/battle get" || text !== "/battle create")
      else {
        await context.reply(`🔴 Greetings! I'm the Battle Oracle, a bot to facilitate pokeframe battles 🔴`);
        await context.send(`🔎 Type /help to learn how I can help you`);
        await context.send(`Let's battle! 🔥`);
      }
    } else {
      await context.reply(`🔴 Greetings! I am the Battle Oracle, your bot guide for facilitating Pokeframe battles. 🔴`);
      await context.send(`To participate in this game, a Warpcast account is required.`);
      await context.send(`Please link your Converse account to Warpcast by following the link below:`);
      await context.send(`http://pokecasterv1.vercel.app/api/subscribe/${address}`);
    }

  } else if (typeId === "reaction") {
    const {
      message: {
        content: { content: emoji, action },
      },
    } = context;
    // if (action === "added" && (emoji === "🔂" || emoji === "🔁")) {
    await context.send("Reactions not implemented yet (:");
  }

  // handle unexpected input
  else {
    context.send(`Error! Unexpected input, try to say hello or type /help to see a complete commands list`)
  }
});
