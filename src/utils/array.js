const sum = numbers => numbers.reduce(
    (prev, current) => prev + current,
    0
)

const sumBy = (predicate, numbers) => numbers.reduce(
    (prev, current) => prev + predicate(current),
    0
)

const sortBy = (predicate, array) => array.sort((a, b) => predicate(a) > predicate(b) ? -1 : 1)

const groupAndFormat = (predicate, format, array) => array.reduce(
    (prev, current) => {
        const index = predicate(current)
        const value = format(prev[index], current)
        
        return { ...prev, [index]: value }
    },
    {}
)

module.exports = {
    sum,
    sumBy,
    sortBy,
    groupAndFormat
}