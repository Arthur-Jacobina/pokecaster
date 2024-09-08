import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { Context, Next } from 'hono';
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';
import { validateFramesPost } from "@xmtp/frames-validator";
import { generateBattleList } from "../image-generation/generator.js";
import { getBattleById, getBattleIdByStatus, registerUser } from "../lib/database.js";
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
app.frame("/", async (c) => {
  const waitingBattles = await getBattleIdByStatus('waiting');
  const battleId = waitingBattles[0];

  return c.res({
    title,
    image: `/bocover.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${battleId}`}>Battles</Button>,
    ],
  });
});

app.frame("/battle/:id", async (c) => {
  const id = Number(c.req.param('id'));
  const battle = await getBattleById(id);
  const battlePokemons = battle.maker_pokemons;

  const waitingBattles = await getBattleIdByStatus('waiting');
  const totalBattles = waitingBattles.length;

  const getNextIndex = (currentIndex: any) => (currentIndex + 1) % totalBattles;
  const getPreviousIndex = (currentIndex: any) => (currentIndex - 1 + totalBattles) % totalBattles;

  const nextBattleId = waitingBattles[getNextIndex(id)];
  const previousBattleId = waitingBattles[getPreviousIndex(id)];

  return c.res({
    title,
    image: `/image/battlelist/${battlePokemons[0]}/${battlePokemons[1]}/${battlePokemons[2]}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/${nextBattleId}`}>⬅️</Button>,
      <Button action={`/`}>✅</Button>,
      <Button action={`/${previousBattleId}`}>➡️</Button>,
    ],
  });
});

app.frame("/subscribe/:wallet", async (c) => {
  const wallet = c.req.param('wallet');

  return c.res({
    title,
    image: `/bocover.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/register/${wallet}`}>Sign up</Button>
    ],
  })
})

app.frame("/register/:wallet", async (c) => {
  const wallet = c.req.param('wallet');
  const fid = c.frameData?.fid;

  await registerUser(fid!, wallet);

  return c.res({
    title,
    image: `/bocover.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button>REGISTERED!</Button>
    ],
  });
})

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