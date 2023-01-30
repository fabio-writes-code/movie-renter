const request = require('supertest')
const mongoose=require('mongoose');
const { Customer } = require('../../../models/customer');
const { User } = require('../../../models/users');



describe('api/customer', () => {
    let customer1, customer2, server
    let token

    beforeEach(async()=>{
        server=require('../../../index')

        token = new User().generateAuthToken()
        customer1=new Customer({
            isGold:true,
            name:'Customer1',
            phone:'123456789'
        })

        customer2=new Customer({
            isGold:false,
            name:'Customer2',
            phone:'987654321'
        })

        await customer1.save()
        await customer2.save()
    })
    
    afterEach(async()=>{
        await Customer.remove({})
        await server.close()
    })

    describe('GET', () => {
        it('should return all customers', async () => {
            const res = await request(server)
                .get('/api/customer')
                .set('x-auth-token',token)
                
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some((c)=>c.name==='Customer1')).toBeTruthy()
            expect(res.body.some((c)=>c.name==='Customer2')).toBeTruthy()
        });

        it('should return 404 if invalid ID', async () => {
            const token= new User().generateAuthToken()
            const res= await request(server)
                .get('/api/customer/1')
                .set('x-auth-token',token)
            expect (res.status).toBe(404)
        });
        
        it('return 404 if id valid but no cx with id', async () => {
            const res =await request(server)
                .get('/api/customer/' + mongoose.Types.ObjectId())
                .set('x-auth-token',token)
            expect(res.status).toBe(404)
        });

        it('should return 401 if user is not logged in', async () => {
            token=''
            const res =await request(server)
                .get('/api/customer/' + mongoose.Types.ObjectId())
                .set('x-auth-token',token)
            expect(res.status).toBe(401)

        });

        it('should return customer id id is valid', async () => {
            const res=await request(server)
                .get('/api/customer/'+customer1._id)
                .set('x-auth-token',token)
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('name',customer1.name)
        });
    });
    
    describe('POST', () => {
        let isGold, name, phone,token

        const exec=()=>{
            return request(server)
                .post('/api/customer')
                .set('x-auth-token',token)
                .send({isGold, name, phone})
        }

        beforeEach(()=>{
            token = new User().generateAuthToken()
            isGold=true
            name='CustomerPost'
            phone='123456789'
        })

        it('should return 400 if name is shorter than 5 chars', async () => {
            name ='123'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 400 if phone is longer than 10 chars ', async () => {
            phone ='123567891011'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 401 if user is not logged in', async () => {
            token=''
            const res =await exec()
            expect(res.status).toBe(401)
        });

        it('should save the customer if info is valid', async () => {
            const res=await exec()
            const cxInDb=await Customer.find({name:'CustomerPost'})
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('name','CustomerPost')
        });
    });

    describe('PUT/', () => {
        let newName, id1, token
        const exec=async ()=>{
            return await request(server)
                .put('/api/customer/'+id1)
                .set('x-auth-token',token)
                .send({name:newName, phone:'123456789'})
        }
        
        beforeEach(()=>{
            token=new User().generateAuthToken()
        })

        it('should return 401 if user is not logged in', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 400 if new name is invalid', async () => {
            id1=customer1._id
            newName='1234'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 404 if invalid id', async () => {
            id1=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 if cx not in data base', async () => {
            id1=mongoose.Types.ObjectId()
            newName='CustomerUpdated'
            const res=await exec()
            const cxInDb=await Customer.findById(id1)
            expect(cxInDb).toBeNull()
            expect(res.status).toBe(404)
        });

        it('should return 200 upon update', async () => {
            id1=customer1._id
            newName='CustomerUpdated'
            const res=await exec()
            expect(res.status).toBe(200)
        });

        it('should return updated cx upon update', async () => {
            id1=customer1._id
            newName='CustomerUpdated'
            const res = await exec()
            expect(res.body).toHaveProperty('name','CustomerUpdated')
        });

        it('should check updated status in db', async () => {
            id1=customer1._id
            newName='CustomerUpdated'
            await exec()
            const cxInDb= await Customer.findById(id1)
            expect(cxInDb.name).toBe('CustomerUpdated')
        });
    });

    describe('DELETE/', () => {
        let id, token

        const exec=async()=>{
            return await request(server)
                .delete('/api/customer/' + id)
                .set('x-auth-token',token)
                .send()
        }

        beforeEach(()=>{
            token= new User({isAdmin:true}).generateAuthToken()
        })

        it('should return 404 if cx does not exists', async () => {
            id=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 401 if user is not logged in', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if user is not admin', async () => {
            token= new User({isAdmin:false}).generateAuthToken()
            const res = await exec()
            expect(res.status).toBe(403)
        });

        it('should return 404 if cx does not exists', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 and cx object upon succesful request', async () => {
            id=customer1._id
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('name','Customer1')
        });

        it('should delete the cx form db', async () => {
            id=customer1._id
            await exec()
            const cxInDb=await Customer.findById(id)
            expect(cxInDb).toBeNull()
        });

    });
});