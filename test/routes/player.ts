import chai from 'chai';
import chaiHttp from 'chai-http';
import api from '../../api/api.js';

import testPlayer from '../data/player.js';

chai.should();
chai.use(chaiHttp);

describe('Player', () =>
{
	before(async () =>
	{
		await api.start();
	});

	after(async () =>
	{
		await api.stop();
	});

	beforeEach(async () =>
	{
		const resCheck = await chai.request(api.app)
			.get('/player/-1');

		resCheck.should.have.status(404);

		if (resCheck.status === 404)
		{
			const resCreate = await chai.request(api.app)
				.post('/player/-1')
				.send(testPlayer);

			resCreate.should.have.status(200);
		}
	});

	afterEach(async () =>
	{
		const resCheck = await chai.request(api.app)
			.get('/player/-1');

		if (resCheck.status === 200)
		{
			const resDelete = await chai.request(api.app)
			.delete('/player/-1');

			resDelete.should.have.status(200);
		}
	});

	describe('/POST player', () =>
	{
		it('POST new player', async () =>
		{
			const resDelete = await chai.request(api.app)
				.delete('/player/-1');

			resDelete.should.have.status(200);

			const resCreate = await chai.request(api.app)
				.post('/player/-1')
				.send(testPlayer);

			resCreate.should.have.status(200);
		});

		it('Try POST with no ID param', async () => 
		{
			const res = await chai.request(api.app)
				.post('/player')
				.send(testPlayer);

			res.should.have.status(400);
		});

		it('Try POST new player under mismatched record', async () =>
		{
			const res = await chai.request(api.app)
				.post('/player/-2')
				.send(testPlayer);

			res.should.have.status(400);
		});

		it('Try POST existing player', async () =>
		{
			const res = await chai.request(api.app)
				.post('/player/-1')
				.send(testPlayer);

			res.should.have.status(409);
		});

		it('Try POST bad ID param', async () =>
		{
			const res = await chai.request(api.app)
				.post('/player/aaa')
				.send(testPlayer);

			res.should.have.status(400);
		});

		it('Try POST no body', async () =>
		{
			const res = await chai.request(api.app)
				.post('/player/-1')
				.send(undefined);

			res.should.have.status(400);
		});
	});

	describe('/GET player', () =>
	{
		it('GET player with ID -1', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/-1');

			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.should.have.property('userId', '-1');
		});

		it('GET non-existent player', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/-2');

			res.should.have.status(404);
			res.body.should.be.empty;
			res.text.should.not.be.empty;
		});

		it('Try GET player with no ID param', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player');

			res.should.have.status(400);
		});

		it('Try GET player with invalid ID', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/aaa');

			res.should.have.status(400);
		});
	});

	describe('/PUT player', () =>
	{
		it('PUT player with ID -1', async () =>
		{
			const resGet = await chai.request(api.app)
				.get('/player/-1');

			resGet.body.should.have.property('username', testPlayer.username);

			const name = 'Updated through API!';
			const resPut = await chai.request(api.app)
				.put('/player/-1')
				.send({username: name});

			resPut.should.have.status(200);

			const resCheck = await chai.request(api.app)
				.get('/player/-1');

			resCheck.body.should.have.property('username', name);
		});

		it('Try PUT player with no ID param', async () =>
		{
			const name = 'Updated through API!';
			const req = await chai.request(api.app)
				.put('/player')
				.send({username: name});

			req.should.have.status(400);
		});

		it('Try PUT non-existent player', async () =>
		{
			const name = 'Updated through API!';
			const res = await chai.request(api.app)
				.put('/player/-2')
				.send({username: name});

			res.should.have.status(404);
		});

		it('Try PUT invalid ID', async () =>
		{
			const name = 'Updated through API!';
			const res = await chai.request(api.app)
				.put('/player/aaa')
				.send({username: name});

			res.should.have.status(400);
		});

		it('Try PUT no body', async () =>
		{
			const res = await chai.request(api.app)
				.put('/player/-1')
				.send(undefined);

			res.should.have.status(400);
		});
	});

	describe('/DELETE player', () =>
	{
		it('DELETE player with ID -1', async () =>
		{
			const res = await chai.request(api.app)
				.delete('/player/-1');

			res.should.have.status(200);
		});

		it('Try DELETE player with no ID param', async () =>
		{
			const res = await chai.request(api.app)
				.delete('/player');

			res.should.have.status(400);
		});

		it('Try DELETE player with invalid ID', async () =>
		{
			const res = await chai.request(api.app)
				.delete('/player/aaa');

			res.should.have.status(400);
		});

		it('Try DELETE non-existent player', async () =>
		{
			const res = await chai.request(api.app)
				.delete('/player/-2');

			res.should.have.status(404);
		});
	});

	describe('Query /player', () =>
	{
		it('Find player with username "Test Player"', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/')
				.send({query: {username: 'Test Player'}});
			
			res.should.have.status(200);
			res.body.should.have.lengthOf(1);
		});

		it('Try find player with username "Real Player"', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/')
				.send({query: {username: 'Real Player'}});
			
			res.should.have.status(200);
			res.body.should.have.lengthOf(0);
		});

		it('Check player result projection', async () =>
		{
			const query = {username: 'Test Player'};
			const options =
				{
				project:
					{
					'_id': 0,
					'username': 1
					}
				};

			const res = await chai.request(api.app)
				.get('/player/')
				.send({query: query, options: options});

			res.should.have.status(200);
			res.body.should.have.lengthOf(1);
			res.body[0].should.have.property('username');
			res.body[0].should.not.have.property('_id');
		});
	});
});