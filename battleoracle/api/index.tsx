import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { Context, Next } from 'hono';
import { validateFramesPost } from "@xmtp/frames-validator";
import { getBattleById, getBattleIdByStatus } from "../lib/database.js";

const title = 'battle-oracle'

const addMetaTags = (client: string, version?: string) => {
  // Follow the OpenFrames meta tags spec
  return {
    unstable_metaTags: [
      { property: `of:accepts`, content: version || "vNext" },
      { property: `of:accepts:${client}`, content: version || "vNext" },
    ],
  };
};

const xmtpSupport = async (c: Context, next: Next) => {
  // Check if the request is a POST and relevant for XMTP processing
  if (c.req.method === "POST") {
    const requestBody = (await c.req.json().catch(() => { })) || {};
    if (requestBody?.clientProtocol?.includes("xmtp")) {
      c.set("client", "xmtp");
      const { verifiedWalletAddress } = await validateFramesPost(requestBody);
      c.set("verifiedWalletAddress", verifiedWalletAddress);
    } else {
      // Add farcaster check
      c.set("client", "farcaster");
    }
  }
  await next();
};

export const app = new Frog<{}>({
  title,
  assetsPath: '/',
  basePath: '/api',
  initialState: {},
  ...addMetaTags("xmtp"),
})

app.use(xmtpSupport);

app.use("/*", serveStatic({ root: "./public" }));


  // XMTP verified address
  // const { verifiedWalletAddress } = c?.var || {};
  // console.log("verifiedWalletAddress", verifiedWalletAddress);
app.frame("/", (c) => {
  return c.res({
    image: `${42}`,
    intents: [
      <Button value="apples">⬅️</Button>,
      <Button value="oranges">✅</Button>,
      <Button value="bananas">➡️</Button>,
    ],
  });
});

app.frame("/:id", async (c) => {
  const id = Number(c.req.param('id'));
  const waitingBattles = await getBattleIdByStatus('waiting');
  const battle = getBattleById(waitingBattles[id]);
  return c.res({
    image: `${42}`,
    intents: [
      <Button action={`/${id+1}`}>⬅️</Button>,
      <Button action={``}>✅</Button>,
      <Button action={`/${id-1}`}>➡️</Button>,
    ],
  });
});

devtools(app, { serveStatic });