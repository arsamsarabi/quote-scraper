import cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import fs from 'fs'

const loadWebpage = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const [page] = await browser.pages()
  await page.goto('https://www.keepinspiring.me/funny-quotes/', {
    waitUntil: 'networkidle2',
  })
  const html = await page.content()
  await browser.close()
  return cheerio.load(html)
}

const writeQuotesToFile = async (quotes: Quote[]) => {
  const data = JSON.stringify(quotes)
  const fileContent = `export const quotes = ${data}`
  fs.writeFile('300-quotes.js', fileContent, (err) => {
    if (err) throw err
    console.info('Quotes written to file.')
  })
}

const trimQuote = (quote: string) =>
  quote
    .substring(0, quote.lastIndexOf('–'))
    .replace('“', '')
    .replace('”', '')
    .trim()

const trimAuthor = (author: string) => author.replace('–', '').trim()

type Quote = {
  quote: string
  author: string
}

const main = async () => {
  const $ = await loadWebpage()
  const quotes: Quote[] = []
  $('.author-quotes').each((i, el) => {
    const quote = trimQuote($(el).text())
    const author = trimAuthor($(el).children('span').text())
    quotes.push({ quote, author })
  })
  writeQuotesToFile(quotes)
}

main()
