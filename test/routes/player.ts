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
		await api.connect();
		const res = await chai.request(api.app)
			.post('/player/-1')
			.send(testPlayer)

		res.should.have.status(200);
	});

	after(async () =>
	{
		api.disconnect();
		const res = await chai.request(api.app)
			.delete('/player/-1')

		res.should.have.status(200);
	});

	describe('/GET player', () =>
	{
		it('GET player with ID -1', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/-1')

			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.should.have.property('userId', -1);
		})

		it('GET error response for player with ID -3', async () =>
		{
			const res = await chai.request(api.app)
				.get('/player/-3')

			res.should.have.status(404);
			res.body.should.be.empty;
			res.text.should.not.be.empty;
		})
	});

	describe('/PUT player', () =>
	{
		it('PUT player with ID -1', async () =>
		{
			const name = 'Updated through API!';
			const resA = await chai.request(api.app)
				.put('/player/-1')
				.send({username: name});

			resA.should.have.status(200);

			const resB = await chai.request(api.app)
				.get('/player/-1');

			resB.body.should.have.property('username', name);
		});
	});
});