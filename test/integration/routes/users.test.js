const request=require('supertest')
const mongoose=require('mongoose')
const {User}=require('../../../models/users');

describe('api/users', () => {
    let user, server,token, id
    beforeEach(async()=>{
        server = require('../../../index')

        user=new User({
            name:'User1',
            email:'user1@uniqueemail.com',
            password:'1234',
            isAdmin:false
        })

        admin=new User({
            name:'Admin',
            email:'admin@uniqueemail.com',
            password:'1234',
            isAdmin:true
        })

        token=admin.generateAuthToken()
        id = user._id

        await user.save()
        await admin.save()

    })
    afterEach(async()=>{
        await User.deleteMany({})
        await server.close()
    })

    describe('GET', () => {
        
        const exec=()=>{
            return request(server)
                .get('/api/users')
                .set('x-auth-token',token)
        }

        it('should return 401 if not logged in', async () => {
            token=''
            const res = await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken()
            const res=await exec()
            expect(res.status).toBe(403)
        });

        it('should return all users in database if admin', async () => {
            const res = await exec()
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
            expect(res.body.some((u)=>u.name==='User1')).toBeTruthy()
            expect(res.body.some((u)=>u.name==='Admin')).toBeTruthy()

        });
    });

    describe('get/id:', () => {
        const exec=()=>{
            return request(server)
                .get('/api/users/' + id)
                .set('x-auth-token',token)
        }
        
        it('should return 401 if not logged in', async () => {
            token=''
            const res = await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken()
            id = user._id
            const res=await exec()
            expect(res.status).toBe(403)
        });

        it('should return 400 if id invalid', async () => {
            id=1
            const res= await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 if user not found', async () => {
            id=mongoose.Types.ObjectId()
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 if valid input', async () => {
            const res = await exec()
            expect(res.status).toBe(200)
        });

        it('should return user if valid input', async () => {
            const res = await exec()
            expect(res.body).toHaveProperty('name',user.name)
        });
    });

    describe('POST', () => {
        let name, email, password, isAdmin

        const exec=()=>{
            return request(server)
                .post('/api/users')
                .set('x-auth-token',token)
                .send({name, email, password})
        }

        beforeEach(()=>{
            name='userPost'
            email='email@uniqueemail.com'
            password='1234'
            isAdmin=false
        })
        
        it('should return 401 if not logged in', async () => {
            token=''
            const res = await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken()
            const res=await exec()
            expect(res.status).toBe(403)
        });

        it('should return 400 if invalid input', async () => {
            name='1'
            const res= await exec()
            expect(res.status).toBe(400)
        });

        it('should return 400 if email already in db', async () => {
            email=user.email
            const res = await exec()
            expect(res.status).toBe(400)
        });

        it('should return 200 if valid input', async () => {
            const res = await exec()
            expect(res.status).toBe(200)
        });

        it('should return user object on valid input', async () => {
            await exec()
            const userInDb= await User.find({name:'userPost'})
            expect (userInDb).not.toBe(undefined)
        });
    });

    describe('PUT', () => {
        let name, email, password

        const exec=()=>{
            return request(server)
                .put('/api/users/'+id)
                .set('x-auth-token',token)
                .send({name, email, password})
        }

        beforeEach(()=>{
            name='userPost'
            email='email@uniqueemail.com'
            password='1234'
            id=user._id
        })
        
        it('should return 401 if not logged in', async () => {
            token=''
            const res = await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken()
            const res=await exec()
            expect(res.status).toBe(403)
        });

        it('should return 400 if invalid id', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 400 if invalid input', async () => {
            name='1'
            const res= await exec()
            expect(res.status).toBe(400)
        });

        it('should return 404 if user not found', async () => {
            id=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 if valid input', async () => {
            const res = await exec()
            expect(res.status).toBe(200)
        });

        it('should return user object on valid input', async () => {
            await exec()
            const userInDb= await User.find({name:'userPost'})
            expect (userInDb).not.toBe(undefined)
        });
    });

    describe('PUT', () => {
        const exec=()=>{
            return request(server)
                .delete('/api/users/'+id)
                .set('x-auth-token',token)
        }

        it('should return 401 if not logged in', async () => {
            token=''
            const res = await exec()
            expect(res.status).toBe(401)
        });

        it('should return 403 if not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken()
            const res=await exec()
            expect(res.status).toBe(403)
        });

        it('should return 400 if invalid id', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 if user not found', async () => {
            id=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 and obejct on valid input', async () => {
            const res = await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('name',user.name)
        });

        it('should delete user object on valid input', async () => {
            await exec()
            const userInDb= await User.findById(id)
            expect (userInDb).toBeNull()
        });
    });
});