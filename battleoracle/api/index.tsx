import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { Context, Next } from 'hono'
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';;
import { validateFramesPost } from "@xmtp/frames-validator";
import { generateBattleList } from "../image-generation/generator.js";
// import { getBattleById, getBattleIdByStatus } from "../lib/database.js";

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
    title,
    image: `/public/bocover.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/0`}>Battles</Button>,
      <Button action={`/`}>Share</Button>,
    ],
  });
});

app.frame("/:id", async (c) => {
  const id = Number(c.req.param('id'));
  // const waitingBattles = await getBattleIdByStatus('waiting');
  // const battle = await getBattleById(waitingBattles[id]);
  // const battlePokemons = battle.maker_pokemons;
  const battlePokemons = [1,4,25];
  return c.res({
    title,
    image: `/image/battlelist/${battlePokemons[0]}/${battlePokemons[1]}/${battlePokemons[2]}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/${id+1}`}>⬅️</Button>,
      <Button action={`/`}>✅</Button>,
      <Button action={`/${id-1}`}>➡️</Button>,
    ],
  });
});

app.hono.get('/image/battlelist/:p1/:p2/:p3', async (c) => {
  try {
    const p1 = Number(c.req.param('p1'));
    const p2 = Number(c.req.param('p2'));
    const p3 = Number(c.req.param('p3'));

    const image = await generateBattleList([p1,p2,p3]);

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)