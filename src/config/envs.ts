import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET_KEY: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_ENDPOINT_SECRET_KEY: string;
};

const envsSchema = joi.object({
  PORT: joi.number().required(),
  STRIPE_SECRET_KEY: joi.string().required(),
  STRIPE_SUCCESS_URL: joi.string().uri().required(),
  STRIPE_CANCEL_URL: joi.string().uri().required(),
  STRIPE_ENDPOINT_SECRET_KEY: joi.string().required(),
}).unknown(true);

const { error, value } = envsSchema.validate( process.env );

if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripeSecretKey: envVars.STRIPE_SECRET_KEY,
  stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
  stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
  stripeEndpointSecretKey: envVars.STRIPE_ENDPOINT_SECRET_KEY,
};
