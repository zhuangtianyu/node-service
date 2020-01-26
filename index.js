const Koa = require('koa')
const Cors = require('koa2-cors')
const Router = require('koa-router')
const fs = require('fs')
const koaBody = require('koa-body')
const EDIT_PASSWORD = require('./edit-password')

const corsConfig = {
  origin: ctx => {
    const WHITE_LIST = ['http://localhost:3000', 'http://zhuangtianyu.com']
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

const fetchArticleMap = () => new Promise((resolve, reject) => {
  fs.readFile('./article-map.json', 'utf8', (error, jsonString) => (
    error !== null ? reject(error) : resolve(JSON.parse(jsonString))
  ))
})

const updateArticleMap = jsonString => new Promise((resolve, reject) => {
  fs.writeFile('./article-map.json', jsonString, 'utf8', error => {
    error !== null ? reject(error) : resolve()
  })
})

router.get('/luck/article/list', async (ctx, next) => {
  try {
    const articleMap = await fetchArticleMap()
    const data = Object.keys(articleMap)
      .map(id => articleMap[id])
      .sort((a, b) => b.timestamp - a.timestamp)
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
      message: '文章映射关系读取失败'
    }
  }
})

router.get('/luck/article/detail/:id', async (ctx, next) => {
  try {
    const articleMap = await fetchArticleMap()
    const id = ctx.params.id
    const article = articleMap[id]
    ctx.body = article !== undefined
      ? { status: true, data: article, message: '请求成功' }
      : { status: false, data: {}, message: '文章详情读取失败' }
  }
  catch {
    ctx.body = {
      status: false,
      data: {},
      message: '文章映射关系读取失败'
    }
  }
})

router.post('/luck/article/edit/permission', (ctx, next) => {
  const params = ctx.request.body
  const { password } = params
  ctx.body = password === EDIT_PASSWORD
    ? { status: true, data: {}, message: '请求成功' }
    : { status: false, data: {}, message: '密码验证失败' }
})

router.post('/luck/article/edit/submit', async (ctx, next) => {
  const params = ctx.request.body
  const { password, title, author, markdownString } = params

  if (password !== EDIT_PASSWORD) {
    return ctx.body = { status: false, data: {}, message: '编辑权限校验--不通过' }
  }

  try {
    const articleMap = await fetchArticleMap()
    const articleList = Object.keys(articleMap).map(id => articleMap[id])
    const id = articleList.length !== 0
      ? articleList.reduce((accumulator, article) => {
          const { id } = article
          return id > accumulator ? id : accumulator
        }, 0) + 1
      : 1000
    const timestamp = new Date().valueOf()
    const article = { id, title, author, timestamp, markdownString }

    try {
      await updateArticleMap(JSON.stringify({ ...articleMap, [id]: article }))
      ctx.body = {
        status: true,
        data: { id },
        message: '请求成功'
      }
    }
    catch {
      ctx.body = {
        status: false,
        data: {},
        message: '文章映射关系写入失败'
      }
    }
  }
  catch {
    ctx.body = {
      status: false,
      data: {},
      message: '文章映射关系读取失败'
    }
  }
})

router.post('/luck/upload', (ctx, next) => {
  const file = ctx.request.files.file
  const reader = fs.createReadStream(file.path);
  const fileName = `${new Date().valueOf()}.${file.name.split('.')[1]}`
  const stream = fs.createWriteStream(`./image/${fileName}`)
  reader.pipe(stream)

  ctx.body = {
    status: true,
    data: { src: `http://zhuangtianyu.com/image/${fileName}` },
    message: '请求成功'
  }
})

app
  .use(cors)
  .use(koaBody({ multipart: true }))
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(1995)








  