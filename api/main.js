import Koa from "koa";
import logger from "koa-logger";
import KoaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import fetch from "node-fetch";
import _ from "lodash";
import session from "koa-session";
import moment from "moment";

import dotenv from "dotenv";
dotenv.config();

const config = {
  apiKey: process.env.IGDB_USER_KEY,
  port: process.env.PORT || 3000,
  secretKey: "SOMETHINGSUPERSECRET"
};

const replaceImages = game => ({
  ...game,
  cover: {
    ...game.cover,
    url: `//images.igdb.com/igdb/image/upload/t_cover_big/${
      game.cover.cloudinary_id
    }.jpg`
  }
});

const recentGamesUrl = () => {
  const time = moment();
  const startOfDay = time.startOf('d').valueOf();

  return (
    `games/?fields=name,first_release_date,cover,esrb,summary,release_dates` +
    `&order=first_release_date` +
    `&filter[first_release_date][gte]=${startOfDay}&filter[cover][exists]=true&filter[esrb][exists]=true&limit=30`
  );
};

const getUpcomingGames = async (platform) => {
  let url = `https://api-endpoint.igdb.com/${recentGamesUrl()}`;

  if (platform) {
    if (platform === 'console') {
      url = `${url}&filter[release_dates.platform][any]=130,49,48,46`;
    } else {
      url = `${url}&filter[release_dates.platform][eq]=${platform}`;
    }
  }

  const result = await fetch(
    url,
    {
      headers: {
        "user-key": config.apiKey,
        Accept: "application/json"
      }
    }
  );

  return await result.json();
};

const app = new Koa();

app.keys = [config.secretKey];

app.use(logger());
app.use(cors({credentials: true}));
app.use(bodyParser());
app.use(session(app));

var router = new KoaRouter();

router.get("/games", async ctx => {
  const platform = ctx.query.platform;

  try {
    const popularGames = await getUpcomingGames(platform);

    ctx.body = popularGames.map(a => replaceImages(a));
  } catch (error) {
    ctx.status = 500;

    ctx.body = { message: error.message };
  }
});

router.get("/platforms", async ctx => {
  let url = `https://api-endpoint.igdb.com/platforms/?order=generation:desc&fields=name`;


  // if (platform && platform === 'console') {
  //   url = `${url}&filter[release_dates.platform][in]=`
  // }

  const result = await fetch(
    url,
    {
      headers: {
        "user-key": config.apiKey,
        Accept: "application/json"
      }
    }
  );

  ctx.body = await result.json();
});

app.use(router.allowedMethods());
app.use(router.routes());

app.listen(config.port, () => {
  console.log(`Started Server on Port ${config.port}`);
});
