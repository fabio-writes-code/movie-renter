const request = require('supertest')
const {Movie}=require('../../../models/movies')
const mongoose = require('mongoose')
const {User}=require('../../../models/users')
const {Genre}= require('../../../models/genres')

describe('api/movies', () => {
    let server, movie1, genre

    
    beforeEach(async () => {
        server = require('../../../index');

        token = new User().generateAuthToken();

        genre = new Genre({ name: 'genre1' });
        await genre.save()

        movie1 = new Movie({
            title:'movie1',
            genre: genre, 
            numberInStock:10,
            dailyRentalRate:2
        });
        await movie1.save()
    })

    afterEach(async()=>{
        await Movie.remove({})
        await Genre.remove({})
        await server.close()
    })

    describe('GET', () => {
        it('should return all movies', async () => {
            const res= await request(server)
                .get('/api/movies')
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body.some((m)=>m.title==='movie1')).toBeTruthy()
        });
    });

    describe('GET/:id', () => {
        let id
        
        const exec=async()=>{
            return await request(server)
                .get('/api/movies/'+id)
        }

        it('should return 404 if movie does not exists', async () => {
            id=mongoose.Types.ObjectId()
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 on invalid id', async () => {
            id=1
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 and object if movie if valid', async () => {
            id=movie1._id
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('title', movie1.title)
        });

    });

    describe('POST', () => {
        let numberInStock, dailyRentalRate
        const exec=async ()=>{
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token',token)
                .send({title, numberInStock, genreId,dailyRentalRate})
        }

        beforeEach(()=>{
            token=new User().generateAuthToken()
            title='MoviePost'
            genreId= genre._id
            numberInStock=10
            dailyRentalRate=2
        })

        it('should return 401 if user is not logged in', async () => {
            token = ''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 400 on data input error', async () => {
            genreId='invalid'
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 404 if genre does not exists', async () => {
            genreId=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 on valid input and return object', async () => {
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('title',title)
        });

        it('should save on succesful input', async () => {
            await exec()
            const movieInDB= await Movie.find({title:'MoviePost'})
            expect(movieInDB).not.toBe(null)
        });
    });
    
    describe('PUT', () => {
        let title, id

        const exec=async ()=>{
            return await request(server)
                .put('/api/movies/'+id)
                .set('x-auth-token',token)
                .send({title, genreId, numberInStock, dailyRentalRate})
        }

        beforeEach(()=>{
            title='NewTitle'
            id=movie1._id;
            genreId=genre._id
            numberInStock=10
            dailyRentalRate=2
        })

        it('should return 401 on invalid auth', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });
        it('should return 400 on invalid input', async () => {
            title=''            
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 400 on invalid genre id', async () => {
            genreId=123
            const res=await exec()
            expect(res.status).toBe(400)
        });

        it('should return 404 if no genre', async () => {
            genreId=mongoose.Types.ObjectId()
            const res=await exec()
            expect(res.status).toBe(404)
        });

        it('should return 404 if movie does not exists', async () => {
            id=mongoose.Types.ObjectId();
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 on valid update and return object', async () => {
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('title',title)
        });

        it('should save on valid input', async () => {
            title='NewTitle'
            id=movie1._id
            await exec()
            const movieInDB= await Movie.findById(id)            
            expect(movieInDB.title).toBe('NewTitle')
        });
    });

    describe('DELETE', () => {
        let title, id

        const exec=async ()=>{
            return await request(server)
                .delete('/api/movies/'+id)
                .set('x-auth-token',token)
                .send()
        }

        beforeEach(()=>{
            id=movie1._id;
        })

        it('should return 401 on invalid auth', async () => {
            token=''
            const res=await exec()
            expect(res.status).toBe(401)
        });

        it('should return 404 if movie does not exists', async () => {
            id=mongoose.Types.ObjectId();
            const res = await exec()
            expect(res.status).toBe(404)
        });

        it('should return 200 on valid input and return object', async () => {
            const res=await exec()
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('title',movie1.title)
        });

        it('should delete on valid input', async () => {
            await exec()
            const movieInDB= await Movie.findById(id)            
            expect(movieInDB).toBeNull()
        });
    });


});
