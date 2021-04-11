import Koa from "koa";
import websocket from "koa-easy-ws";
import { config } from "./config";
import { search } from "./routes/search";

const app = new Koa();
app.use(websocket());
app.use(async (ctx, next) => {
  if (!ctx.ws) {
    next();
  }

  if (ctx.ws) {
    const ws: WebSocket = await ctx.ws();
    search({ query: "oceans" })
      .subscribe((value) => {
        ws.send(JSON.stringify(value));
      })
      .add(() => {
        ws.close();
      });
  }
});

app.use((ctx) => {
  ctx.body = "Hello World";
});

app.listen(config.port, () => {
  console.log(`🚀 Listening on :${config.port}`);
});
