const Koa = require('koa')
const Cors = require('koa2-cors')
const Router = require('koa-router')

const corsConfig = {
  origin: ctx => {
    const WHITE_LIST = ['http://localhost:3000']
    const requestOrigin = ctx.request.header.origin
    return WHITE_LIST.includes(requestOrigin) ? '*' : false
  }
}

const app = new Koa()
const cors = new Cors(corsConfig)
const router = new Router()

const sleep = (ms = 1000) => new Promise((resolve) => {
  setTimeout(() => resolve(), ms)
})

router.get('/drink/list', async (ctx, next) => {
  await sleep(), ctx.body = {
      status: true,
      data: [{ name: 'cola' }],
      message: ''
  }
  console.log(ctx.body)
  next()
})

app
  .use(cors)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(1995)



