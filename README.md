# Compliance Mobile App

## Purpose / Usage

This app helps your agency verify that the data provided to MDS by mobility service providers actually matches what's happening on the street.

Currently this takes two forms:

**1) Monitoring Vehicle Compliance as Reported by Providers**

- Verifying that vehicles registered with MDS are actually present on the street.
- Reporting vehicles which are present on the street but not in MDS.
- Noting broken, mis-parked, etc. vehicles.

**2) Auditing Vehicle Trips**

This involves taking a trip on a provider vehicle (scooter or bike) and simultaneously using the Compliance Mobile app to create a matching "audit trip". You can then compare the audit trip with the provider trip data submitted to MDS to:

- Ensure that the provider is reporting `trip_start`, `trip_end`, etc events accurately and in a timely manner.
- Verify that telemetry for the trip is being reported accurately and that it roughly matches telemetry recorded during the audit.

A full user manual is beyond the scope of this document, please see:

- [Compliance-Mobile-Instructions.pdf](Compliance-Mobile-Instructions.pdf)

## Setup for your Agency

The app has been set up to run under `dev` and `production` deployment environments, with an optional `staging` deployment as well. At runtime, the app will automatically load the appropriate configuration according to the current deployment.

To make things easier to follow, the default setup below assumes you're trying to get the development server running first on `localhost`, pointing to the `mds-audit` endpoint also running on `localhost`. See below for additional instructions to set up [production](#production-deployment) and [staging](#staging-deployment) deployments.

Before you can run the Compliance Mobile app you must do the following:

1. Set up the [MDS-audit](#api-server) service
2. Create a free [Auth0 account](#auth0) and set up an Auth0 app
3. Create a free [Mapbox account](#mapbox)
4. Specify your [agency-specific configuration](#agency-specific-config)

### <a name="api-server">1</a>. MDS-Audit Service Setup

You will need to set up the MDS-Audit service to field API requests from the app. For detailed instructions, please see:

- [`mds-audit`](https://github.com/cityOfLosAngeles/mds-js/packages/mds-audit)

### <a name="auth0">2</a>. Auth0 Account Setup

- If you have not already done so, [set up a free Auth0 account](https://auth0.com/signup).
- Create an Auth0 [Single Page Application (SPA)](https://auth0.com/docs/quickstart/spa/react) for the compliance mobile app, and configure its callback URLs for your deployment.
- (Optional) configure an Auth0 Rule to [whitelist logins to the SPA](https://auth0.com/docs/rules).
- Specify the Auth0 Client ID as the audience used by the audit API authorizer function

### <a name="mapbox">3</a>. Mapbox Account setup

- If you do not already have one, [sign up for a free Mapbox account](https://account.mapbox.com/auth/signup/)
- Find your [mapbox account token](https://account.mapbox.com/access-tokens/): you'll enter it below.

### <a name"agency-specific-config">4</a>. Agency-Specific Configuration Setup

Configuration has been centralized in the following files:

| File | Purpose|
| ---- | ------ |
| `src/config/production.js` | Settings for `production` deployment. <br/>Note that this is the basis of the `dev` and `staging` deployments as well.
| `src/config/dev.js`        | Overrides for local development. <br/>Settings in this file will be deep-merged with the `production.js` settings.
| `src/config/staging.js`    | Optional overrides for `staging` deployment. <br/>Settings in this file will be deep-merged with the `production.js` settings.

Note that when setting values as described below, a value entered in `production.js` will generally be available to all three environments unless you specifically override it in the `config/dev.js` or `config/staging.js` files.

- Edit `src/config/production.js` and set the following variables:

| Path | Value / Purpose
| ---- | --------------- |
| `authentication.auth0.domain`                 | Auth0 domain
| `authentication.auth0.clientId`               | Auth0 clientId
| `apps.compliance.mapbox.token`                | Mapbox account token.
| `apps.compliance.mapbox.settings.initialZoom` | GPS coordinates for the center of the vehicle map. You might, for example, set this to your agency headquarters or another recognizable landmark.
| `provider.activeProviders`                    | Case-INsensitive list of names of active mobility service providers for your agency.
<br/>See `[mds-providers](https://github.com/cityOfLosAngeles/mds-js/packages/mds-providers)` package for the full list.

## Local Development

To run the development server, run the following commands from the same directory as this README:

```
yarn
yarn start
```

- The development server will start on port 3001. Initial compilation takes a bit of time.
- The `start` process should open a web browser to [https://localhost:3001](https://localhost:3001) -- if it does not, go to that URL manually.
- Note that the app MUST run under `https` to enable geolocation functionality. The browser will complain that this is unsafe -- just choose "Show Details" and accept the security exception.
- As you edit source files (including the configuration files mentioned above), the app will quickly re-compile your changes and reload the web browser for you.

## <a name="#production-deployment">Production Deployment</a>

The app is currently set up to deploy to Amazon S3, but deploying to other services should be similar.

To set things up for production deployment:

1) Get a production version of the `mds-audit` service running.

Implementation details are outside the scope of this document.  Typical production requirements include: horizontal scaling to handle load, TLS termination, and token authorization.

2) Set up your s3 account:

- Create a private S3 bucket with static web hosting enabled.
- Add an AWS CloudFront distribution to provide caching and TLS termination
- Documentation: https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/

3) Edit `.env.production` and set the following variables

| Variable        | Value / Purpose |
| --------------- | --------------- |
| `CM_S3_PROFILE` | S3 profile name
| `CM_S3_BUCKET`  | S3 bucket name

4) Edit `src/config/production.js` and set the following:

| Path | Value / Purpose
| ---- | --------------- |
| `apps.compliance.app.url`    | Absolute URL to the front-end app in your S3 instance.<br/>NOTE: this MUST be an `https` URL.
| `apps.serverEndpoints.audit` | Path to the production audit endpoint</br>NOTE: this will probably end with `/audit`.

5) From the command line (in the same directory of this README), do:

```
yarn deploy:production
```

- Deployment takes a bit of time.
- Once deployment has finished, navigate to the app in a web browser.

## <a name="#staging-deployment">Staging Deployment</a>

Setting up a staging deployment is virtually the same as production deployment above, except that you'll be editing different configuration files.

To set things up for staging deployment:

1) Get a staging version of the `mds-audit` service running.

2) Set up your s3 staging account:

- Create a private S3 bucket with static web hosting enabled.
- Add an AWS CloudFront distribution to provide caching and TLS termination
- Documentation: https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/

3) Edit `.env.staging` and set the following variables

- `CM_S3_PROFILE`: S3 profile name
- `CM_S3_BUCKET`: S3 bucket name

4) Edit `src/config/staging.js` and set the following:

| Path | Value / Purpose
| ---- | --------------- |
| `apps.compliance.app.url`    | Absolute URL to the staging app in your staging S3 instance.<br/>NOTE: this MUST be an `https` URL.
| `apps.serverEndpoints.audit` | Path to the staging audit endpoint</br>NOTE: this will probably end with `/audit`.

5) From the command line (in the same directory of this readme), do:

```
yarn deploy:staging
```

- Deployment takes a bit of time.
- Once deployment has finished, navigate to the app in a web browser.
