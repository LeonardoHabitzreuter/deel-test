const { sum } = require('#utils/array')

describe('array', () => {
    describe('sum', () => {
        it('should return 55 when passed 25 and 30', () => {
            const result = sum([25, 30])
            expect(result).toBe(55)
        })
    })  
})