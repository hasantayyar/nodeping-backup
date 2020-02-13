exports.asyncForEach = async (a, fn) => {
  for (let index = 0; index < a.length; index++) {
    await fn(a[index], index, a)
  }
}

exports.mapResults = (results) => results.map(d => (
  {
    id: d._id,
    start: d.s,
    end: d.e,
    duration: d.rt,
    locations: JSON.stringify(d.l),
    target: d.tg,
    interval: d.i,
    success: d.su
  }
))
