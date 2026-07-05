/** Gets the combine name */
export function combinePaths(...names: string[])
{
  return names.filter(n => !isEmpty(n)).join('.')
}

/**
 * is null
 */
export function isNull(value: any)
{
  return value == null || value == undefined || value === ""
}

export function isEmpty(value: any)
{
  if (isNull(value)) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof(value) === "object")
  {
    for (let k in value)
    {
      return false
    }
    return true
  }
  return false
}

/**
 * Debounce function
 * @param fn
 * @param wait
 */
export function debounce(fn: Function, wait: number)
{
  let timer:any = 0
  const func = function (...args: any[])
  {
    if (timer) { clearTimeout(timer); timer = 0 }
    if (args.length && args[0] === clearDebounce) return
    timer = setTimeout(() => fn(...args), wait)
  }

  func.cancel = () =>
  {
    if (timer) { clearTimeout(timer); timer = 0 }
  }

  return func
}

/**
 * Clear timeout of debounce function
 */
export function clearDebounce(debouncedFn: Function)
{
  ;(debouncedFn as any).cancel?.()
  debouncedFn(clearDebounce)
}

export function debounceby(fn: Function, wait: Function)
{
  let timer:any = 0
  return function (...args: any[])
  {
    if (timer) {
      clearTimeout(timer)
      timer = 0
    }
    const waiter = wait()
    if(waiter)
    {
      timer = setTimeout(() => fn(...args), waiter)
    }
    else
    {
      fn(...args)
    }
  }
}


/**
 * Check is equal
 */
export function isEqual(a: any, b: any, t: string | null = null): boolean {
  if (a == b || isNull(a) && isNull(b)) return true

  // Array check
  if (Array.isArray(a) || Array.isArray(b))
  {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.findIndex((f, i) => !isEqual(f, b[i])) < 0
  }
  
  // For date
  if (t === "system.date" || t === "system.fulldate" || t === "system.yearmonth") {
    if (a instanceof Date)
    {
      // Pass
    }
    else if (typeof (a) === "string" || typeof(a) === "number")
    {
      a = new Date(a)
      if (isNaN(a.getFullYear())) a = null
    }
    else
    {
      a = null
    }

    if (b instanceof Date)
    {
      // Pass
    }
    else if (typeof (b) === "string" || typeof(b) === "number")
    {
      b = new Date(b)
      if (isNaN(b.getFullYear())) b = null
    }
    else
    {
      b = null
    }

    if(a && b)
    {
      if(t === "system.yearmonth")
      {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
      }
      else if(t === "system.fulldate")
      {
        return a.toISOString() === b.toISOString()
      }
      else
      {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
      }
    }
  }

  // Common
  if (a instanceof Date && b instanceof Date)
  {
    return a.getTime() === b.getTime()
  }
  
  // Object
  if (a && b && typeof a === "object" && typeof b === "object")
  {
    const flds = new Set<string>()
    for(let f in Object.getOwnPropertyNames(a))
    {
      if (!isEqual(a[f], b[f])) return false
      flds.add(f)
    }
    for(let f in Object.getOwnPropertyNames(b))
    {
      if (!flds.has(f)) return false
    }
  }

  return false
}

/**
 * Wrap a function so the same query will not be executed multiple times
 */
export function useShareQuery<T>(queryFunc: (...args:any[]) => Promise<T>)
{
  const querys: {
    [key: string]: {
      args: any[],
      querys: {
        resolve: Function,
        reject: Function
      }[]
    }
  } = {}
  const process: { [key: string]: boolean } = {}
  const querymap:any = {}

  const processQuery = (key: string) =>
  {
    if (!querys[key] || process[key] || querys[key].querys.length === 0) return
    process[key] = true

    // Already done
    if (querymap[key] !== null && querymap[key] !== undefined)
    {
      querys[key].querys.forEach(q => q.resolve(querymap[key]))
      delete querys[key]
      delete process[key]
    }

    // Process
    queryFunc(...querys[key].args)
      .then(res => {
        querymap[key] = res
        querys[key].querys.forEach(q => q.resolve(res))
      })
      .catch(ex => {
        querys[key].querys.forEach(q => q.reject(ex))
      })
      .finally(() => {
        delete querys[key]
        delete process[key]
      })
  }

  return function (...args: any[]) {
    const key = JSON.stringify(args)

    // Delay to process
    setTimeout(() => processQuery(key), 10);
    return new Promise((resolve, reject) => {
      if (querymap[key]) return resolve(querymap[key])

      // Queue
      querys[key] = querys[key] || { args, querys: [] }
      querys[key].querys.push({ resolve, reject })
    }) as unknown as Promise<T>
  }
}

//#endregion

//#region Queue query

/**
 * Use queue to process query
 */
export function useQueueQuery<T>(queryFunc: (...args: any[]) => Promise<T>)
{
  const queues: {
    args: any[],
    resolve: Function,
    reject: Function
  }[] = []
  let processing = 0

  const processQuery = async () => {
    // single thread - record time
    if (processing && (new Date().getTime() - processing) < 1000) return

    // process queue
    let task = queues.shift()
    while (task) {
      processing = new Date().getTime()
      try {
        task.resolve(await queryFunc(...task.args))
      }
      catch (ex) {
        task.reject(ex)
      }
      task = queues.shift()
    }

    // reset
    processing = 0
  }

  return function (...args: any[])
  {
    setTimeout(() => processQuery(), 5)
    return new Promise((resolve, reject) => queues.push({ args, resolve, reject })) as unknown as Promise<T>
  }
}

//#endregion

//#region utility

/**
 * deep clone
 */
export function deepClone(value: any, noemptyarr = false): any
{
  if (Array.isArray(value))
  {
    return value.map(v => deepClone(v, noemptyarr))
  }
  else if (value && typeof (value) === "object")
  {
    if (value instanceof Date) return value
    const ret:any = {}
    for (var k in value)
    {
      const res = deepClone(value[k], noemptyarr)
      if (isNull(res)) continue
      if (noemptyarr && Array.isArray(res) && !res.length) continue
      ret[k] = res 
    }
    return ret
  }
  else
  {
    return value
  }
}

/**
 * clone value with json format
 */
export function jsonClone(value: any): any
{
  return isNull(value) ? value : JSON.parse(JSON.stringify(deepClone(value)))
}

/**
 * Generate guid parts
 */
export function generateGuidPart(): string {
  return 'xxxx'.replace(/x/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16).toUpperCase()
  })
}

/**
 * Generate a guid
 */
export function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase()
  })
}

/**
 * format string
 */
export function sformat(template: string | ILocaleString, ...args: any[]) {
  return `${_L(template)}`.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== 'undefined' ? _L(args[index]) : match;
  });
}