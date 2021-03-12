import Koa from "koa";
import websocket from "koa-easy-ws";
import { search } from "./routes/search";

const app = new Koa();
app.use(websocket());
app.use(async (ctx, next) => {
  console.log("i am here");
  if (!ctx.ws) {
    next();
  }

  if (ctx.ws) {
    const ws = await ctx.ws();
    search({ query: "oceans" })
      .subscribe((value) => {
        ws.send(value);
      })
      .add(() => {
        ws.close();
      });
  }
});

app.use((ctx) => {
  ctx.body = "Hello World";
});

app.listen(3000);
