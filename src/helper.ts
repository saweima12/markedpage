export const format = (format: string, params: Record<string, any>) => {
  let result = format;
  Object.entries(params).map(([key, value]) => {
    let regex = new RegExp(`{${key}}`);
    result = result.replace(regex, value);
  })
  return result
}

export default {
  format
}
