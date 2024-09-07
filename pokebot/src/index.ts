import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  const { message: { typeId } } = context;
  console.log(typeId);
  if (typeId === "text" || typeId === "reply") {
    const { message: { content: { content: text } } } = context;

    // list of battles with status = "waiting"
    if (text === "/battle") {
      await context.send(`https://edpon-frames.vercel.app/api`);
    } 
    
    // TBD
    if (text === "/battle create") {
      await context.send(`https://edpon-frames.vercel.app/api`);
    } 

    // TBD
    if (text === "/battle get") {
      await context.send(`https://edpon-frames.vercel.app/api`);
    } 

    // list of commands available + short descriptions
    else if (text === "/help") {
      await context.send(`🔎 Commands below are currently available`);
      await context.send(`/battle -> sends a list of joinable battles`);
      await context.send(`/battle get <id> -> get a battle by its id and play it on the chat`);
      await context.send(`/battle create -> creates a new battle`);
    } 
    
    // fallback in caso of unexpected text
    else {
      await context.reply(`🔴 Greetings! I'm the Battle Oracle, a bot to facilitate pokeframe battles 🔴`);
      await context.send(`🔎 Type /help to learn how I can help you`);
      await context.send(`Let's battle! 🔥`);
    }
  } else if (typeId === "reaction") {
    const {
      message: {
        content: { content: emoji, action },
      },
    } = context;
    if (action === "added" && (emoji === "🔂" || emoji === "🔁")) {
      await context.send("(:");
    }
  }

  // handle unexpected input
  else {
    context.send(`Error! Unexpected input, try to say hello or type /help to see a complete commands list`)
  }
});
