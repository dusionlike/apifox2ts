export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'

interface BaseOptions {
  url: string
  method: Method
  params?: any
}

type FetchFN = <T>(options: BaseOptions) => Promise<T>

let customFetch: FetchFN | null = null

export function overrideFetch(fn: FetchFN) {
  customFetch = fn
}

export async function request<T>({
  url,
  method,
  params,
}: BaseOptions): Promise<T> {
  if (customFetch) {
    return customFetch({ url, method, params })
  } else {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (res.ok) {
      const data = await res.json()
      return data
    } else {
      throw new Error(res.statusText)
    }
  }
}
