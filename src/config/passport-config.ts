import passport, { PassportStatic } from 'passport';
import { Strategy as stratJwt, ExtractJwt } from 'passport-jwt';
import Debug from 'debug';

import appConfig from './config.js';

const debug = Debug('fries-rest:config:passport');

const extractors =
[
	ExtractJwt.fromAuthHeaderAsBearerToken(),
	ExtractJwt.fromBodyField('token'),
	ExtractJwt.fromUrlQueryParameter('token')
];

passport.serializeUser((user, done) =>
{
	done(null, user);
})

passport.deserializeUser((user: any, done) =>
{
	done(null, user);
});

const config = (passport: PassportStatic) =>
{
	passport
		.use('jwt', new stratJwt(
			{
				secretOrKey: appConfig.auth.clientSecret,
				jwtFromRequest: ExtractJwt.fromExtractors(extractors)
			},
			async (token, done) =>
			{
				try
				{
					return done(null, token);
				}
				catch (err)
				{
					return done(err);
				}
			}
		))
}

passport.initialize();
config(passport);

export const Config = config;

export default passport;