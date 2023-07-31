import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import type { OpenAPIV3 } from './types/openai'

export { type Apifox2tsConfig, defineConfig } from './config'
export { request, overrideFetch } from './request'

/**
 * 将apifox的api数据转换为typescript代码
 * @param sourceURL api数据地址，可以是http/https地址，也可以是本地文件路径
 * @param destPath 生成的ts文件路径
 */
export async function apifox2ts(sourceURL: string, destPath: string) {
  const apiData = await getApiData(sourceURL)
  let fileText = ''

  fileText += openapi2tsHeader(apiData)

  fileText += "\nimport { request } from 'apifox2ts'\n"

  for (const pathKey of Object.keys(apiData.paths)) {
    const pathData = apiData.paths[pathKey]
    if (pathData) {
      const method = Object.keys(pathData)[0] as OpenAPIV3.HttpMethods
      const pData = pathData[method]
      if (pData) {
        fileText += openapi2tsCode(pData, pathKey, method)
      }
    }
  }

  const destFilePath = destPath
  if (!fs.existsSync(destFilePath)) {
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true })
  }
  await fs.promises.writeFile(destFilePath, fileText, 'utf-8')
}

async function getApiData(sourceURL: string): Promise<OpenAPIV3.Document> {
  if (sourceURL.startsWith('http') || sourceURL.startsWith('https')) {
    const resStr = await getJson(sourceURL)
    return JSON.parse(resStr)
  }
  if (fs.existsSync(sourceURL)) {
    const resStr = await fs.promises.readFile(sourceURL, 'utf-8')
    return JSON.parse(resStr)
  }
  throw new Error('sourceURL is not a valid url or file path')
}

/**
 * nodejs get请求获取json数据，兼容http和https
 */
function getJson(sourceURL: string) {
  return new Promise<string>((resolve, reject) => {
    const lib = sourceURL.startsWith('https') ? https : http
    const request = lib.get(sourceURL, (response: any) => {
      const { statusCode } = response
      if (statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${statusCode}`))
      }
      response.setEncoding('utf8')
      let rawData = ''
      response.on('data', (chunk: any) => {
        rawData += chunk
      })
      response.on('end', () => {
        try {
          resolve(rawData)
        } catch (e) {
          reject(e)
        }
      })
    })
    request.on('error', (err: any) => {
      reject(err)
    })
    request.end()
  })
}

/**
 * 将openapi数据转换为typescript代码，组装顶部注释
 */
function openapi2tsHeader(apiData: OpenAPIV3.Document) {
  const textLines: string[] = []
  textLines.push(
    '/* eslint-disable eslint-comments/no-unlimited-disable */',
    '/* eslint-disable */',
    '/* tslint:disable */',
    '// @ts-nocheck',
    '/* 当前文件由apifox2ts自动生成，请勿手动修改 */',
    `/* 项目名称：${apiData.info.title} */`,
    `/* 项目描述：${apiData.info.description || '无'} */`,
    `/* 项目版本：${apiData.info.version} */`,
    ''
  )
  return textLines.join('\n')
}

/**
 * 将openapi数据转换为typescript代码，组装接口代码
 */
function openapi2tsCode(
  pData: OpenAPIV3.OperationObject,
  url: string,
  method: string
) {
  const name = path2name(url)

  const textLines: string[] = ['']

  const renderSchema = (schema: OpenAPIV3.SchemaObject, level = 1) => {
    if (schema && schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key]

        // 注释
        if (prop.description) {
          textLines.push(`${getSpace(level * 2)}/** ${prop.description} */`)
        }

        if (prop.type === 'object') {
          textLines.push(
            `${getSpace(level * 2)}${key}${
              schema.required?.includes(key) ? '' : '?'
            }: {`
          )
          renderSchema(prop, level + 1)
          textLines.push(`${getSpace(level * 2)}}`)
        } else if (prop.type === 'array') {
          if (prop.items.type === 'object') {
            textLines.push(
              `${getSpace(level * 2)}${key}${
                schema.required?.includes(key) ? '' : '?'
              }: {`
            )
            renderSchema(prop.items, level + 1)
            textLines.push(`${getSpace(level * 2)}}[]`)
          } else {
            textLines.push(
              `${getSpace(level * 2)}${key}${
                schema.required?.includes(key) ? '' : '?'
              }: ${prop.items.type || 'unknown'}[]`
            )
          }
        } else {
          textLines.push(
            `${getSpace(level * 2)}${key}${
              schema.required?.includes(key) ? '' : '?'
            }: ${prop.type || 'unknown'}`
          )
        }
      }
    }
  }

  // 请求参数类型
  let requestType = ''
  if (pData.parameters && pData.parameters.length > 0) {
    requestType = `IRequestParams${name}`
    textLines.push(`export interface ${requestType} {`)
    for (const param of pData.parameters) {
      // 注释
      if (param.description) {
        textLines.push(`  /** ${param.description} */`)
      }
      textLines.push(
        `  ${param.name}${param.required ? '' : '?'}: ${
          param.schema?.type || 'unknown'
        }`
      )
    }
    textLines.push('}', '')
  } else if (pData.requestBody) {
    const bodySchema = pData.requestBody.content['application/json'].schema

    if (bodySchema) {
      requestType = `IRequestBody${name}`
      textLines.push(`export interface ${requestType} {`)
      renderSchema(bodySchema)
      textLines.push('}', '')
    }
  }

  // 返回结果类型
  const responseType = `IResponseData${name}`
  const responseSchema =
    pData.responses['200'].content?.['application/json'].schema

  if (responseSchema) {
    textLines.push(`export interface ${responseType} {`)
    renderSchema(responseSchema)
    textLines.push('}', '')
  }

  // 接口函数注释
  textLines.push(
    `/**`,
    ` * ${pData.summary || '无'}${
      pData.description ? ` - ${pData.description}` : ''
    }`,
    ` */`
  )

  // 接口函数
  if (requestType) {
    textLines.push(
      `export function fetch${name}(params: ${requestType}) {`,
      `  return request<${responseType}>({`,
      `    url: '${url}',`,
      `    method: '${method.toLocaleUpperCase()}',`,
      `    params,`,
      `  })`,
      `}`,
      ''
    )
  } else {
    textLines.push(
      `export function fetch${name}() {`,
      `  return request<${responseType}>({`,
      `    url: '${url}',`,
      `    method: '${method.toLocaleUpperCase()}',`,
      `  })`,
      `}`,
      ''
    )
  }

  return textLines.join('\n')
}

/**
 * 将路由转换成接口名称，去掉斜杠，首字母大写
 */
function path2name(path: string) {
  const list = path
    .split('/')
    .filter(Boolean)
    .map(item => {
      // 首字母大写
      return item.replace(/^\S/, s => s.toUpperCase())
    })
  return list.join('')
}

/**
 * 返回指定数量的空格
 */
function getSpace(count: number) {
  return Array.from({ length: count + 1 }).join(' ')
}
