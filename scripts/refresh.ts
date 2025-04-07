import sources from "../shared/sources.json"

Promise.all(Object.keys(sources).map(id =>
  fetch(`https://gametrend.storeapi/s?id=${id}`),
)).catch(console.error)
