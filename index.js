const Koa = require('koa')
const Cors = require('koa2-cors')
const Router = require('koa-router')
const fs = require('fs')

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

router.get('/luck/article/list', async (ctx, next) => {
  const service = () => new Promise((resolve, reject) => {
    fs.readFile('./article-map.json', 'utf8', (error, data) => (
      error !== null ? reject(error) : resolve(data)
    ))
  })

  try {
    const articleMap = JSON.parse(await service())
    const data = Object.keys(articleMap).map(id => articleMap[id])
    ctx.body = {
      status: true,
      data,
      message: '请求成功'
    }
  }
  catch {
    ctx.body = {
      status: false,
      data: [],
      message: '文章映射列表读取失败'
    }
  }
})

app
  .use(cors)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(1995)
