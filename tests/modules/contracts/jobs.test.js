const request = require('supertest');
const app = require('#src/app');
const clearDB = require('#scripts/clearDb')
const { Profile, Contract, Job } = require('#src/model');

const createProfile = (id, params) => Profile.create({
    id,
    firstName: 'Harry',
    lastName: 'Potter',
    profession: 'Wizard',
    balance: 1150,
    type:'client',
    ...params
})

const createContract = (id, params) => Contract.create({
    id,
    terms: 'bla bla bla',
    status: 'terminated',
    ...params
})

const createJob = (id, params) => Job.create({
    id,
    description: 'work',
    price: 200,
    paid: false,
    ...params
})

describe('/jobs', () => {
    describe('/:job_id/pay', () => {
        const clientId = 1
        const contractorId = 2

        beforeEach(async () => {
            await Promise.all([
                createProfile(clientId, { balance: 400 }),
                createProfile(contractorId, { balance: 400 })
            ])
        })

        afterEach(clearDB)

        it("should pay the job and transfer the money from client's balance to contractor", async () => {
            await createContract(1, { ClientId: clientId, ContractorId: contractorId })
            await createJob(1, { ContractId: 1, price: 200 })

            const response = await request(app).post('/jobs/1/pay').set('profile_id', clientId)
            
            expect(response.status).toEqual(200);
            expect(response.text).toEqual("Ok");
            expect((await Job.findByPk(1)).paid).toEqual(true);
            expect((await Profile.findByPk(clientId)).balance).toEqual(200);
            expect((await Profile.findByPk(contractorId)).balance).toEqual(600);
        })

        describe('fail cases', () => {
            afterEach(async () => {
                const profiles = await Profile.findAll()
                expect(profiles.find(x => x.id === clientId).balance).toEqual(400);
                expect(profiles.find(x => x.id === contractorId).balance).toEqual(400);
            })

            it('should return 401 when no profile_id informed', async () => {
                const response = await request(app).post('/jobs/1/pay')
    
                expect(response.status).toEqual(401);
            })
    
            it('should return 404 when job not found', async () => {
                const response = await request(app).post('/jobs/1/pay').set('profile_id', 1)
    
                expect(response.status).toEqual(404);
                expect(response.text).toEqual('Job not found!');
            })
    
            it("should return 401 when client doesn't have access to the job", async () => {
                await createContract(1, { ClientId: contractorId, ContractorId: clientId })
                await createJob(1, { ContractId: 1 })
    
                const response = await request(app).post('/jobs/1/pay').set('profile_id', clientId)
    
                expect(response.status).toEqual(401);
                expect(response.text).toEqual('You are not the client of this job!');
                expect((await Job.findByPk(1)).paid).toEqual(false);
            })
    
            it("should return 200 when job is already paid", async () => {
                await createContract(1, { ClientId: clientId, ContractorId: contractorId })
                await createJob(1, { ContractId: 1, paid: true })
    
                const response = await request(app).post('/jobs/1/pay').set('profile_id', clientId)
                
                expect(response.status).toEqual(200);
                expect(response.text).toEqual('This job was already paid!');
            })

            it("should not pay when client doesn't have enough money", async () => {
                await createContract(1, { ClientId: clientId, ContractorId: contractorId })
                await createJob(1, { ContractId: 1, price: 1000 })
    
                const response = await request(app).post('/jobs/1/pay').set('profile_id', clientId)
                
                expect(response.status).toEqual(200);
                expect(response.text).toEqual("Sorry, it looks like you don't have enough money to pay for this job.");
                expect((await Job.findByPk(1)).paid).toEqual(false);
            })
        })
    })
})