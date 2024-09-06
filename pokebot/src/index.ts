import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  const { message: { typeId } } = context;
  console.log(typeId);
  if (typeId === "text" || typeId === "reply") {
    const { message: { content: { content: text } } } = context;
    if (text === "/battle") {
      await context.reply(`https://edpon-frames.vercel.app/api`);
    } 
  } else if (typeId === "reaction") {
    const {
      message: {
        content: { content: emoji, action },
      },
    } = context;
    if (action === "added" && (emoji === "🔂" || emoji === "🔁")) {
      await context.send("https://edpon-frames.vercel.app/api");
    }
  }
  // send just sends the frame in the chat 
  // when pinging the user is necessary consider using reply 
  // await context.send(`https://edpon-frames.vercel.app/api`);
});
